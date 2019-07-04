# Live Emojing

Live-emojing is a Livecoding technique to include the audience in the performance. Spectators input  patterns in an intuitive manner by sending series of **emojis** via social networks.

You can find an in-depth explanation [here](http://diegodorado.github.io/en/works/live-emojing/)

This  plugin allows you to add an audience-emoji-participation to your livecoding performance.

## Requirements

This package depends on the [tidalcycles](https://atom.io/packages/tidalcycles) package and [tidalcycles](https://tidalcycles.org/index.php/Welcome) itself.


## Installation

Install this package to Atom using through the settings page or by running

```bash
apm install live-emojing
```

## How to use

Open a `.tidal` file, put your cursor between the double quotes of a `sound ""` ( or `s ""` ) pattern , and hit `ctrl+shift+e`.

This will bind that text region any incoming emoji pattern messages.
You can open as many text region as you want.

You can toggle to a normal editor hitting `ctrl+alt+shift+e`, although you will loose those text regions bindings.

You can get messages from

  1. [live emojing playground](https://diegodorado.github.io/labs/live-emojing) (the easiest way)
  2. a telegram bot
  3. *(WIP) this chrome extension*
  4. *(WIP) roll your own*

*Currently only 1 and 2 works*


## How to Configure

  1. Open the Settings View (`ctrl + ,` or `cmd + ,`).
  2. Go into Packages and search for `live emojing` package.
  3. Click on **Settings** on the package card.


## Configuring Playground

Actually, you don't need to. It just works out of the box.  
But if you want to avoid getting your messages mixed with someone else you can provide a **channel name** other than the default one (`live-emojing`) and also, if you are going to stream, be kind to provide the **streaming url** so people can watch where they are sending their patterns ( and how does that sounds!)

## Configuring Telegram

To create a Telegram Bot is free and fairly easy.
Follow the [Telegram API docs](https://core.telegram.org/bots#6-botfather) about that. Then, adjust this package settings and be sure to **enable telegram api** and **set the telegram token**.

Your bot messages will be fetched periodically as soon as you bind a text region as described above.  
Any message someone sends to the bot will be bumped to your editor while you are live emojing.


## How are emojis mapped to sounds

Emojis are replaced by a string before sending it to tidal repl.  
For example, `d1 $ s "💗👏"` will be transformed to `d1 $ s "bd cp"`

How this mapping is done is defined in a JSON file located in the same folder as the `.tidal` file you are playing with, and with the name of `emojis.json`  
If not found, it will look for the same file at the root of your project.  
If still not found, it will take a default `emojis.json` from the package data folder.

Go ahead and [download it](https://raw.githubusercontent.com/diegodorado/atom-live-emojing/master/data/emojis.json) as a starting template to customize your emoji mappings.

Structure is fairly simple. It is a JSON Array of Array.

```js
[
  ["💪","hardkick"],   // a sample
  ["👏","cp:3"],       // sample with index
  ["💙💚💜","bd"],     // many aliases
  ["🤫🤐","~"],        // silence is valid!
  ["😺😼😹😻","cat:"], // trailing colon, syntactic sugar
  ["","feel:1"]        // catch them all
]
```

A short mapping like that one will result in the following assignments

```js
  "💪" => "hardkick"
  "👏" => "cp:3"
  "💙" => "bd"
  "💚" => "bd"
  "💜" => "bd"
  "🤫" => "~"
  "🤐" => "~"
  "😺" => "cat:0"
  "😼" => "cat:1"
  "😹" => "cat:2"
  "😻" => "cat:3"
  "anything else" => "feel:1"
```

The default mapping should work for starting. It uses *SuperDirt-Samples*.

The `emojis.json` is being watched for changes so you can edit it as you play, although you will has to re-evaluate the tidal code to hear the difference.

## Getting emojis on the background scene

You can ask **SuperDirt** to inform every time an emoji sound has been triggered by placing and executing the following code in **SuperCollider**.
Doing so will allow the package, which has an OSC server listening on a port you define ( defaults to **3333**), to place those emojis on the background scene.


```supercollider
(
n  = NetAddr("127.0.0.1",3333);
~dirt.receiveAction = { |e|

    if ( e.at(\emoji).isNil,{e[\emoji]=0},{});

    if ( e.at(\emoji)>0  ,
        {
            n.sendMsg("/emoji",
                e.at(\emoji),
                e.at(\cycle),
                e.at(\cps),
                e.at(\delta),
                e.at(\latency),
                e.at(\z_order));
            //e.postln;
        },
        {}
    );
}
);

```

You can copy and paste this code in your `startup.scd` if you are using it often.
Or [download it](https://raw.githubusercontent.com/diegodorado/atom-live-emojing/master/sendEmojis.scd) to execute only when you want to.


### Spreading along the z-axis

Multiple `sound` with emoji patterns may get overlapped on the background scene, unless you execute a single code block.

So, if you have something like this

```haskell
d1 $ stack[
  s "💙👏",
  iter 4 $ s "👐🙌",
  s "<😻😽✊*4👍>" # crush 4]
```

Or

```haskell
do
  d1 $ s "💙👏"
  d2 $ iter 4 $ s "👐🙌"
  d3 $ s "<😻😽✊*4👍>" # crush 4
```

each ocurrence of `s "some emojis"` will get an increasing z order, meaning they will appear further away on the background scene.

But, if you have different code blocks like this

```haskell
d1 $ s "💙👏"

d2 $ iter 4 $ s "👐🙌"

d3 $ s "<😻😽✊*4👍>" # crush 4
```

every time you execute one of them they will start at the same z order and will get overlapped.

To overcome this trouble, you can fix the `z_order` of the pattern. So, in the above example, you can force the `z_order` like this:


```haskell
d1 $ s "💙👏" # z_order 0

d2 $ iter 4 $ s "👐🙌" # z_order 1
```

And you can of course give it a pattern

```haskell
d1 $ s "💙*4👏*8" # z_order (run 8)

d2 $ s "✋*16" # coarse 20 # z_order (slow 4 $ sine * 8)
```

## Known Issues

I apologize in advance for eating your RAM. After some long time of running you may have to reload Atom. There are some leaks I haven't resolved yet.

Expect many bugs, but be certain that this package will be improved.  
Let me know if [you are having any issue](https://github.com/diegodorado/atom-live-emojing/issues)
