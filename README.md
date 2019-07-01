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
