console.log('a');

import 'a';

console.log('dont bother with a');

import a from 'a';

console.log('I need you A', a.isUsed());

import moduleA from 'a';
import moduleB from 'b';
import moduleC from 'c';

console.log('123');

import moduleA from 'a';
import moduleB from 'b';
import moduleC from 'c';
import 'd';

console.log('xyz');
