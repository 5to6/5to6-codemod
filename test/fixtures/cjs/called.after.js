// stacked comment
import aFactory from 'var-stacked-comment';

const a = aFactory();
import bFactory from 'var-no-comment';
const b = bFactory('arg for b');
import cFactory from 'var-inline-comment';
const c = cFactory({ some: 'arg' }); // with inline comment
import deFactory from 'var-decomposition';
const { d, e } = deFactory();
import gFactory from 'multi-var-g';
const g = gFactory();
import hFactory from 'multi-var-h';
const h = hFactory();
import jFactory from 'multi-var-j';
const j = jFactory();

var f = 'x', unassigned, i = 'bar';
