import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, userHasHistory } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';
import RecommendedForYou from 'reader/recommendations/for-you';

import a from 'import-outside';
import 'import-expression-inside-function';
import 'import-expression-inside-if';
import 'import-expression-inside-else-if';
import 'import-expression-inside-else';
import 'import-expression-inside-for';
import 'import-expression-inside-while';
import b from 'import-inside-function';
import d from 'import-inside-if';
import e from 'import-inside-else-if';
import f from 'import-inside-else';
import g from 'import-inside-for';
import h from 'import-inside-while';

function block() {
  var c = true ? require('import-expression-ternary-if') : require('import-expression-ternary-else')
  if (true) {} else if (false) {} else {}

  for (var i = 0; i < 10; i++) {}

  while (true) {}
}
