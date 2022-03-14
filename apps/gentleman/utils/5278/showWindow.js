function showWindow(k, url, mode, cache, menuv) {
    mode = isUndefined(mode) ? 'get' : mode;
    cache = isUndefined(cache) ? 1 : cache;
    var menuid = 'fwin_' + k;
    var menuObj = $(menuid);
    var drag = null;
    var loadingst = null;
    var hidedom = '';
    if (disallowfloat && disallowfloat.indexOf(k) != -1) {
        if (BROWSER.ie) url += (url.indexOf('?') != -1 ? '&' : '?') + 'referer=' + escape(location.href);
        location.href = url;
        doane();
        return;
    }
    var fetchContent = function () {
        if (mode == 'get') {
            menuObj.url = url;
            url += (url.search(/\\?/) > 0 ? '&' : '?') + 'infloat=yes&handlekey=' + k;
            url += cache == -1 ? '&t=' + (+new Date()) : '';
            if (BROWSER.ie && url.indexOf('referer=') < 0) {
                url = url + '&referer=' + encodeURIComponent(location);
            }
            ajaxget(url, 'fwin_content_' + k, null, '', '', function () {
                initMenu();
                show();
            });
        } else if (mode == 'post') {
            menuObj.act = $(url).action;
            ajaxpost(url, 'fwin_content_' + k, '', '', '', function () {
                initMenu();
                show();
            });
        }
        if (parseInt(BROWSER.ie) != 6) {
            loadingst = setTimeout(function () {
                showDialog('', 'info', '<img src=\"' + IMGDIR + '/loading.gif\"> 請稍候...')
            }, 500);
        }
    };
    var initMenu = function () {
        clearTimeout(loadingst);
        var objs = menuObj.getElementsByTagName('*');
        var fctrlidinit = false;
        for (var i = 0; i < objs.length; i++) {
            if (objs[i].id) {
                objs[i].setAttribute('fwin', k);
            }
            if (objs[i].className == 'flb' && !fctrlidinit) {
                if (!objs[i].id) objs[i].id = 'fctrl_' + k;
                drag = objs[i].id;
                fctrlidinit = true;
            }
        }
    };
    var show = function () {
        hideMenu('fwin_dialog', 'dialog');
        v = {
            'mtype': 'win',
            'menuid': menuid,
            'duration': 3,
            'pos': '00',
            'zindex': JSMENU['zIndex']['win'],
            'drag': typeof drag == null ? '' : drag,
            'cache': cache
        };
        for (k in menuv) {
            v[k] = menuv[k];
        }
        showMenu(v);
    };
    if (!menuObj) {
        menuObj = document.createElement('div');
        menuObj.id = menuid;
        menuObj.className = 'fwinmask';
        menuObj.style.display = 'none';
        $('append_parent').appendChild(menuObj);
        evt = ' style=\"cursor:move\" onmousedown=\"dragMenu($(\\'
        ' + menuid + '\\
        '), event, 1)\" ondblclick=\"hideWindow(\\'
        ' + k + '\\
        ')\"';
        if (!BROWSER.ie) {
            hidedom = '<style type=\"text/css\">object{visibility:hidden;}</style>';
        }
        menuObj.innerHTML = hidedom + '<table cellpadding=\"0\" cellspacing=\"0\" class=\"fwin\"><tr><td class=\"t_l\"></td><td class=\"t_c\"' + evt + '></td><td class=\"t_r\"></td></tr><tr><td class=\"m_l\"' + evt + ')\">&nbsp;&nbsp;</td><td class=\"m_c\" id=\"fwin_content_' + k + '\">' + '</td><td class=\"m_r\"' + evt + '\"></td></tr><tr><td class=\"b_l\"></td><td class=\"b_c\"' + evt + '></td><td class=\"b_r\"></td></tr></table>';
        if (mode == 'html') {
            $('fwin_content_' + k).innerHTML = url;
            initMenu();
            show();
        } else {
            fetchContent();
        }
    } else if ((mode == 'get' && (url != menuObj.url || cache != 1)) || (mode == 'post' && $(url).action != menuObj.act)) {
        fetchContent();
    } else {
        show();
    }
    doane();
}