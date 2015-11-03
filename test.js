//import jamis from 'jquery';
//import 'jamis';
/*
var jamis = require('jquery');
var $ = require('jquery');
var $ = require("jquery");
require('something');
*/
// FAILS: this totally fails right now (only takes last one)
var _ = require('underscore'),
       Backbone = require('backbone'),
       BaseView = require('BaseView');

// FAILS: this needs to be import { routeTo } from '../../helper';
var routeTo = require('../../helper').routeTo;

// FAILS: how do we know if these need to be '* as'? Should that be the default?
// this is a less common scenario I think...

var tips = [
  "Click on any AST node with a '+' to expand it",

];

function printTips() {
  tips.forEach((tip, i) => console.log(`Tip ${i}:` + tip));
}

var foo = 'hi';
