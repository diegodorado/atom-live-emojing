# Live Emojing

Live-emojing is a Livecoding technique I developed with the intention of including the audience in the performance. Spectators input  patterns in an intuitive manner by sending series of **emojis** via social networks.

You can find an in-depth explanation [here](http://diegodorado.github.io/en/works/live-emojing/)

This  plugin allows you to enhance your livecoding performance by adding an audience-emoji-participation to it.

## Requirements

This package depends on the [tidalcycles](https://atom.io/packages/tidalcycles) package.


## Installation

Install this package to Atom using through the settings page or by running

```bash
apm install live-emojing
```

## How to use

Open a `.tidal` file, put your cursor between the double quotes of a `sound ""` ( or `s ""` ) pattern , and hit `ctrl+shift+e`.

This will bind that text region any incoming emoji pattern messages.


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

You can put this in your `startup.scd` if you are using it often.

### Spreading along the z-axis

Multiple `sound` with emoji patterns may get overlapped on the background scene, unless you execute a single code block.

So, if you have something like this

```haskell
d1 $ stack[
  s "💙👏",
  iter 4 $ s "👐🙌",
  s "<😻😽✊*4👍>" # crush 10]
```

Or

```haskell
do
  d1 $ s "💙👏"
  d2 $ iter 4 $ s "👐🙌"
  d3 $ s "<😻😽✊*4👍>" # crush 10
```

each ocurrence of `s "some emojis"` will get an increasing z order, meaning they will appear further away on the background scene.

But, if you have different code blocks like this

```haskell
d1 $ s "💙👏"

d2 $ iter 4 $ s "👐🙌"

d3 $ s "<😻😽✊*4👍>" # crush 10
```

every time you execute one of them they will start at the same z order and will get overlapped.

To overcome this trouble, you can fix the `z_order` of the pattern. So, in the above example, you can force the `z_order` like this:


```haskell
d1 $ s "💙👏" # z_order 0

d2 $ iter 4 $ s "👐🙌" # z_order 1

d3 $ s "<😻😽✊*4👍>" # crush 10 # z_order 2
```
