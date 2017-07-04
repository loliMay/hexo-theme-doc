//
//
// inherited code from hexo meteor theme
//
// -------------------------------------------

(function (options) {
  var scrolling = false;
  var scrollTimeout;
  var activeLink = document.querySelector('.sidebar-link.current');
  var allLinks = [];

  // create sub links for h2s
  var h2s = options.selectors.indexOf('h2') > -1 ? document.querySelectorAll('h2') : [];

  // find all h3s and nest them under their h2s
  var h3s = options.selectors.indexOf('h3') > -1 ? document.querySelectorAll('h3') : [];

  var isAfter = function(e1, e2) {
    return e1.compareDocumentPosition(e2) & Node.DOCUMENT_POSITION_FOLLOWING;
  };

  var h2sWithH3s = [];
  var j = 0;
  for (var i = 0; i < h2s.length; i++) {
    var h2 = h2s[i];
    var nextH2 = h2s[i+1];
    var ourH3s = [];
    while (h3s[j] && isAfter(h2, h3s[j]) && (!nextH2 || !isAfter(nextH2, h3s[j]))) {
      ourH3s.push({ header: h3s[j] });
      j++;
    }

    h2sWithH3s.push({
      header: h2,
      subHeaders: ourH3s
    });
  }

  if (h2sWithH3s.length) {
    activeLink && createSubMenu(activeLink.parentNode, h2sWithH3s);

    if(!activeLink) { // link is not in the sidebar, just make headers "linkable"
      Array.prototype.forEach.call(h2sWithH3s, function (h) {
        makeHeaderLinkable(h.header)
      });
    }

    smoothScroll.init({
      speed: 400,
      callback: function () {
        scrolling = false
      }
    })
  }

  function createSubMenu (container, headers) {
    var subMenu = document.createElement('ul');
    subMenu.className = 'sub-menu';
    container.appendChild(subMenu)
    Array.prototype.forEach.call(headers, function (h) {
      var link = createSubMenuLink(h.header);
      subMenu.appendChild(link);
      if (h.subHeaders) {
        createSubMenu(link, h.subHeaders)
      }
      makeHeaderLinkable(h.header)
    })
  }

  function createSubMenuLink (h) {
    allLinks.push(h);
    var headerLink = document.createElement('li');
    headerLink.innerHTML =
      '<a href="#' + h.id + '" data-scroll class="' + h.tagName + '"><span>' + (h.title || h.textContent) + '</span></a>';
    headerLink.firstChild.addEventListener('click', onLinkClick);
    return headerLink;
  }

  function makeHeaderLinkable (h) {
    var anchor = document.createElement('a');
    anchor.className = 'anchor';
    anchor.href = '#' + h.id;
    anchor.setAttribute('aria-hidden', true);
    anchor.setAttribute('data-scroll', '');
    anchor.innerHTML = '<span class="icon-link"></span>';
    anchor.addEventListener('click', onLinkClick);
    h.insertBefore(anchor, h.firstChild);

    var anchorOffset = document.createElement('div');
    anchorOffset.id = h.id;
    anchorOffset.className = 'anchor-offset';
    h.insertBefore(anchorOffset, h.firstChild);

    h.removeAttribute("id");
  }

  function onLinkClick (e) {
    const _subMenu = document.querySelector('.sub-menu');
    if (_subMenu && _subMenu.contains(e.target)) { setActive(e.target) }
    scrolling = true
    document.body.classList.remove('sidebar-open')
  }

  // setup active h3 update
  window.addEventListener('scroll', updateSidebar);
  window.addEventListener('resize', updateSidebar);

  function updateSidebar () {
    if (scrolling) return;
    var doc = document.documentElement;
    var top = doc && doc.scrollTop || document.body.scrollTop;
    var last;
    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];
      if (link.offsetTop - 120 > top) {
        if (!last) last = link;
        break
      } else {
        last = link;
      }
    }
    if (last) {
      setActive(last);
    }
  }

  function setActive (link) {
    var previousActive = document.querySelector('.sub-menu .active');

    var hash = link.hash;
    if (!hash) {
      if (link.parentNode.tagName === 'A') {
        hash = link.parentNode.hash;
      } else {
        hash = link.getElementsByTagName('a')[0].hash;
      }
    }
    var id = hash.slice(1);
    var currentActive = document.querySelector('.sub-menu a[href="#' + id + '"]');
    if (currentActive !== previousActive) {
      if (previousActive) previousActive.classList.remove('active');
      currentActive.classList.add('active');
    }
  }


  // scroll sidebar page link into view on page load (except for the top link)
  var atRoot = location.pathname === '/' || location.pathname === '/index.html';
  if (!atRoot || location.hash !== '') {
    try{
      // hexo rewrites the URLs to be relative, so the current page has href="".
      document.querySelector('.item-toc a[href=""]').scrollIntoView();
    }catch(err) {
      console.warn(err);
    }
  }

  // version select
  var currentVersion = location.pathname.match(/^\/(v\d[^\/]+)/);
  ;[].forEach.call(document.querySelectorAll('.version-select'), function (select) {
    if (currentVersion) {
      [].some.call(select.options, function (o) {
        if (o.value === currentVersion[1]) {
          o.selected = true;
          return true;
        }
      })
    }
    select.addEventListener('change', function () {
      var targetPath = '/';
      if (select.selectedIndex !== 0) {
        targetPath = '/' + select.value + '/';
      }
      location.assign(targetPath);
    })
  });

  // fastclick to remove click delay in mobile browsers
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }

  // mobile
  document.querySelector('.js-sidebar-toggle')
    .addEventListener('click', function () {
      document.body.classList.toggle('sidebar-visible')
    });

  document.querySelector('.content')
    .addEventListener('click', function() {
      document.body.classList.remove('sidebar-visible')
    })
})({
  selectors: ['h2']
});