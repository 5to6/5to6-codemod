// stacked comment
import aFactory from 'var-stacked-comment';

const a = aFactory();
import bFactory from 'var-no-comment';
const b = bFactory('arg for b');
import cFactory from 'var-inline-comment'; // with inline comment
const c = cFactory({ some: 'arg' });
import deFactory from 'var-decomposition';
const { d, e } = deFactory();
import jFactory from 'multi-var-j';
const j = jFactory();
import hFactory from 'multi-var-h';
const h = hFactory();
import gFactory from 'multi-var-g';
const g = gFactory();

var f = 'x', unassigned, i = 'bar';
