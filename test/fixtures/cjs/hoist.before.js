import trackScrollPage from 'lib/track-scroll-page';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, userHasHistory } from 'reader/controller-helper';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';
import RecommendedForYou from 'reader/recommendations/for-you';

var a = require('import-outside');

function block() {
  require('import-expression-inside-function');
  var b = require('import-inside-function');

  var c = true ? require('import-expression-ternary-if') : require('import-expression-ternary-else')
  if (true) {
    require('import-expression-inside-if');
    var d = require('import-inside-if');
  } else if (false) {
    require('import-expression-inside-else-if');
    var e = require('import-inside-else-if');
  } else {
    require('import-expression-inside-else');
    var f = require('import-inside-else');
  }

  for (var i = 0; i < 10; i++) {
    require('import-expression-inside-for');
    var g = require('import-inside-for');
  }

  while (true) {
    require('import-expression-inside-while');
    var h = require('import-inside-while');
  }
}
