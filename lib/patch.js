'use babel'
import fs from 'fs'
import chokidar from 'chokidar'
import compareVersions from 'compare-versions'

const mapFileName = 'emojis.json'
const mapFilePath = __dirname + '/../data/' + mapFileName
let map = {}
let patched = false


const patchTidalCycles = async () => {
  if(patched)
    return

  const ed = atom.workspace.getActiveTextEditor()
  const packages = atom.packages.loadedPackages

  if (!ed)
    throw new Error("No active editor. Open a tidal file.")

  // check if tidalcycles package is installed
  if (!packages.hasOwnProperty('tidalcycles'))
    throw new Error("You must have TidalCycles package installed.")


  const tidalVersion = packages.tidalcycles.metadata.version
  if(compareVersions(tidalVersion, '0.13.0')===-1)
    throw new Error("You must upgrade TidalCycles package to at least 0.13.0 version.")

  // is this tidalcycles?
  if (ed.getGrammar().scopeName !== "source.tidalcycles")
    throw new Error("This is not a tidal file")


  //load tidal if not loaded
  if (packages.tidalcycles.mainModule === null) {
    const editorView = atom.views.getView(atom.workspace)
    atom.commands.dispatch(editorView, "tidalcycles:boot")
    //wait until tidal has booted
    await atom.packages.activatePackage('tidalcycles')
  }

  loadMap()

  const tidalRepl = packages.tidalcycles.mainModule.tidalRepl

  // define these in tidal
  const boot = `
    z_order = pF "z_order"
    emoji = pF "emoji"
  `
  tidalRepl.tidalSendLine(boot)

  // replace tidalSendLine function to wrap the emoji parser
  tidalRepl.tidalSendLine = function(code) {
    code = parseEmojis(code)
    this.stdinWrite(code)
    this.stdinWrite('\n')
  }

  patched = true
}



let z_order = 0

const parseEmojis = (text) => {
  if(!/(s)(?:ound)?\s+"(.*?)"/.test(text)){
    z_order = 0
  }

  return text.replace(/(s)(?:ound)?\s+"(.*?)"/g, (matchedString, sound, string) => {
    let sounds = []
    let emojis = []

    for (c of string) {
      if (c.codePointAt(0) < 128) {
        // numbers, operators,letters, etc
        sounds.push(c)
        emojis.push(c)
      } else {
        if (map[c] === null){
          sounds.push('[~]')
          emojis.push('[0]')
        }
        else{
          //embrace them just in case
          sounds.push("["+map[c]+"]")
          emojis.push("["+c.codePointAt(0)+"]")
        }
      }
    }
    let text = ` s "${sounds.join('')}" # emoji "${emojis.join('').replace(/([A-Za-z]\w+)(:\d+)?/g, "0")}" # z_order ${z_order} `
    z_order++
    return text

  })


}



const getMapPath = () => {
  const ed = atom.workspace.getActiveTextEditor()

  //get emojis.json at current file path
  let path = ed.getPath().replace(ed.getFileName(),'') + mapFileName
  if (fs.existsSync(path))
    return path

  //gets  emojis.json at current project path
  path = atom.workspace.project.rootDirectories[0].realPath
  path += '/' + mapFileName

  if (fs.existsSync(path))
    return path

  // else, get default mapping
  return mapFilePath

}

const loadMap = () => {
  const path = getMapPath()

  doLoadMap(path)

  // Initialize watcher.
  const watcher = chokidar.watch(path, { persistent: true})
  watcher.on('change', (path, stats) => {
    const oldMap = Object.assign({}, map)
    doLoadMap(path);
    let detail = 'These emojis have changed \n'
    for(key of Object.keys(map)){
      if (oldMap[key] !== map[key])
        detail += `  ${key} --> ${map[key]} \n`
    }
    atom.notifications.addInfo("Emoji mapping changed.",{detail:detail})
  })
}

const doLoadMap  = (path) =>  {
  let s = fs.readFileSync(path).toString()
  map = {}
  let rules = JSON.parse(s)
  rules.forEach((s) => {
    let i = 0
    for (const c of s[0].replace(' ', '')) {
      // if map ends with colon, assign different indexes
      // to each emoji
      map[c] = s[1] + (/:$/.test(s[1])?i++:'')
    }
  })
}




export {patchTidalCycles}



/*
FOXDOT SNIPPET

    // is this foxdot?
    if (ed.getGrammar().scopeName == "source.python") {
      if (atom.packages.loadedPackages.foxdot.mainModule == null) {
        atom.notifications.addWarning("Iniciar FoxDot antes.")
        return false
      } else {
        foxdot = true
        this.commentStart = '# '
        atom.packages.loadedPackages.foxdot.mainModule.evaluateCode = function(code) {
          code = parseEmojis(code)
          let stdin = this.childProcess.stdin;
          stdin.write(code);
          stdin.write('\n\n');
        }
      }
    }
*/
