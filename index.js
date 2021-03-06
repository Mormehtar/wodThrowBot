'use strict';

const  TelegramBot = require('node-telegram-bot-api');
const debug = require('debug')('throwBot');


const utils = require('./utils');
const  config = require('./config/config.json');

// replace the value below with the Telegram token you receive from @BotFather
const {token} = config.telegram;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.on('polling_error', (error) => {
  debug(`Polling error: ${error.code}`);  // => 'EFATAL'
  debug(error);
});

bot.on('webhook_error', (error) => {
  debug(`Webhook error: ${error.code}`);  // => 'EPARSE'
});

// Matches "/echo [whatever]"
bot.onText(/\/start/, (msg, match) => {
  debug('start');
  const chatId = msg.chat.id || msg.from.id;
  bot.sendMessage(chatId, 'Please enter message'
    + ' as "axb" where a is a number of dice and b'
    + ' is difficulty. You can also add keyword "spec"'
    + ' if it is speciality or "damage" if it is damage.');
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  if (!msg || msg.text === '/start') {
    return;
  }
  msg.text = msg.text
    .replace('/roll', '')
    .replace('/roll@WodThrowBot', '')
    .replace('/хуйни', '')
    .replace('/хуйни@WodThrowBot', '')
    .replace('/кшдд', '')
    .replace('/кшдд@WodThrowBot', '')
    .toLowerCase()
    .trim();
  debug('message');
  debug(msg);
  const chatId = msg.chat.id || msg.from.id;
  let params;
  try {
    params = utils.parseRequest(msg.text);
  }
  catch (e) {
    bot.sendMessage(chatId, e.toString());
    return;
  }
  const res = utils.throwDices(params);
  const reply = utils.parseResult(res);
  const resStr = utils.resultToStr(reply);
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, resStr);
});
