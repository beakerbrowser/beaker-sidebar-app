// @beaker/dat-serve-resolve-path@1.0.0
window.datServeResolvePath=function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){const{join:n}=r(1),o=r(3);t.exports=async function(t,e,r,s){var i,a="string"==typeof r?o(r,!0):r,h=decodeURIComponent(a.path);h||(h="/"),-1!==h.indexOf("?")&&(h=h.slice(0,h.indexOf("?")));const u=async r=>{if(!i){e&&e.web_root&&!a.query.disable_web_root&&(r=r?n(e.web_root,r):e.web_root);try{(i=await t.stat(r)).path=r}catch(t){}}};if(h.endsWith("/"))await u(h+"index.html"),await u(h+"index.md"),await u(h);else{await u(h);for(let t of(c=void 0,l=void 0,c=[],((l=(s||"").split(",")).includes("text/html")||1===l.length&&"*/*"===l[0])&&c.push(".html"),l.includes("text/css")&&c.push(".css"),(l.includes("image/*")||l.includes("image/apng"))&&(c=c.concat([".png",".jpg",".jpeg",".gif"])),c))await u(h+t);if(i&&i.isDirectory()){let t=i;i=null,await u(h+".html"),t&&!i&&(i=t)}}var c,l;if(Boolean(e&&e.fallback_page&&!a.query.disable_fallback_page)&&(!i||i.isDirectory())){let t=i;i=null,await u(e.fallback_page),i||(i=t)}return i}},function(t,e,r){(function(t){function r(t,e){for(var r=0,n=t.length-1;n>=0;n--){var o=t[n];"."===o?t.splice(n,1):".."===o?(t.splice(n,1),r++):r&&(t.splice(n,1),r--)}if(e)for(;r--;r)t.unshift("..");return t}function n(t,e){if(t.filter)return t.filter(e);for(var r=[],n=0;n<t.length;n++)e(t[n],n,t)&&r.push(t[n]);return r}e.resolve=function(){for(var e="",o=!1,s=arguments.length-1;s>=-1&&!o;s--){var i=s>=0?arguments[s]:t.cwd();if("string"!=typeof i)throw new TypeError("Arguments to path.resolve must be strings");i&&(e=i+"/"+e,o="/"===i.charAt(0))}return(o?"/":"")+(e=r(n(e.split("/"),function(t){return!!t}),!o).join("/"))||"."},e.normalize=function(t){var s=e.isAbsolute(t),i="/"===o(t,-1);return(t=r(n(t.split("/"),function(t){return!!t}),!s).join("/"))||s||(t="."),t&&i&&(t+="/"),(s?"/":"")+t},e.isAbsolute=function(t){return"/"===t.charAt(0)},e.join=function(){var t=Array.prototype.slice.call(arguments,0);return e.normalize(n(t,function(t,e){if("string"!=typeof t)throw new TypeError("Arguments to path.join must be strings");return t}).join("/"))},e.relative=function(t,r){function n(t){for(var e=0;e<t.length&&""===t[e];e++);for(var r=t.length-1;r>=0&&""===t[r];r--);return e>r?[]:t.slice(e,r-e+1)}t=e.resolve(t).substr(1),r=e.resolve(r).substr(1);for(var o=n(t.split("/")),s=n(r.split("/")),i=Math.min(o.length,s.length),a=i,h=0;h<i;h++)if(o[h]!==s[h]){a=h;break}var u=[];for(h=a;h<o.length;h++)u.push("..");return(u=u.concat(s.slice(a))).join("/")},e.sep="/",e.delimiter=":",e.dirname=function(t){if("string"!=typeof t&&(t+=""),0===t.length)return".";for(var e=t.charCodeAt(0),r=47===e,n=-1,o=!0,s=t.length-1;s>=1;--s)if(47===(e=t.charCodeAt(s))){if(!o){n=s;break}}else o=!1;return-1===n?r?"/":".":r&&1===n?"/":t.slice(0,n)},e.basename=function(t,e){var r=function(t){"string"!=typeof t&&(t+="");var e,r=0,n=-1,o=!0;for(e=t.length-1;e>=0;--e)if(47===t.charCodeAt(e)){if(!o){r=e+1;break}}else-1===n&&(o=!1,n=e+1);return-1===n?"":t.slice(r,n)}(t);return e&&r.substr(-1*e.length)===e&&(r=r.substr(0,r.length-e.length)),r},e.extname=function(t){"string"!=typeof t&&(t+="");for(var e=-1,r=0,n=-1,o=!0,s=0,i=t.length-1;i>=0;--i){var a=t.charCodeAt(i);if(47!==a)-1===n&&(o=!1,n=i+1),46===a?-1===e?e=i:1!==s&&(s=1):-1!==e&&(s=-1);else if(!o){r=i+1;break}}return-1===e||-1===n||0===s||1===s&&e===n-1&&e===r+1?"":t.slice(e,n)};var o="b"==="ab".substr(-1)?function(t,e,r){return t.substr(e,r)}:function(t,e,r){return e<0&&(e=t.length+e),t.substr(e,r)}}).call(this,r(2))},function(t,e){var r,n,o=t.exports={};function s(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function a(t){if(r===setTimeout)return setTimeout(t,0);if((r===s||!r)&&setTimeout)return r=setTimeout,setTimeout(t,0);try{return r(t,0)}catch(e){try{return r.call(null,t,0)}catch(e){return r.call(this,t,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:s}catch(t){r=s}try{n="function"==typeof clearTimeout?clearTimeout:i}catch(t){n=i}}();var h,u=[],c=!1,l=-1;function f(){c&&h&&(c=!1,h.length?u=h.concat(u):l=-1,u.length&&p())}function p(){if(!c){var t=a(f);c=!0;for(var e=u.length;e;){for(h=u,u=[];++l<e;)h&&h[l].run();l=-1,e=u.length}h=null,c=!1,function(t){if(n===clearTimeout)return clearTimeout(t);if((n===i||!n)&&clearTimeout)return n=clearTimeout,clearTimeout(t);try{n(t)}catch(e){try{return n.call(null,t)}catch(e){return n.call(this,t)}}}(t)}}function m(t,e){this.fun=t,this.array=e}function v(){}o.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];u.push(new m(t,e)),1!==u.length||c||a(p)},m.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=v,o.addListener=v,o.once=v,o.off=v,o.removeListener=v,o.removeAllListeners=v,o.emit=v,o.prependListener=v,o.prependOnceListener=v,o.listeners=function(t){return[]},o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},function(t,e,r){const n="undefined"==typeof window,o=n?r(4).parse:function(t){return new URL(t)},s=/[a-z]+:\/\//i,i=/^(dat:\/\/)?([^\/]+)(\+[^\/]+)(.*)$/i;t.exports=function(t,e){s.test(t)||(t="dat://"+t);var r,a=null,h=i.exec(t);return h?(r=o((h[1]||"")+(h[2]||"")+(h[4]||""),e),a=h[3].slice(1)):r=o(t,e),n?r.href=t:r.path=r.pathname,r.version=a,r}},function(t,e,r){"use strict";var n=r(5),o=r(8);function s(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}e.parse=b,e.resolve=function(t,e){return b(t,!1,!0).resolve(e)},e.resolveObject=function(t,e){return t?b(t,!1,!0).resolveObject(e):e},e.format=function(t){o.isString(t)&&(t=b(t));return t instanceof s?t.format():s.prototype.format.call(t)},e.Url=s;var i=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,h=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,u=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),c=["'"].concat(u),l=["%","/","?",";","#"].concat(c),f=["/","?","#"],p=/^[+a-z0-9A-Z_-]{0,63}$/,m=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,v={javascript:!0,"javascript:":!0},d={javascript:!0,"javascript:":!0},g={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},y=r(9);function b(t,e,r){if(t&&o.isObject(t)&&t instanceof s)return t;var n=new s;return n.parse(t,e,r),n}s.prototype.parse=function(t,e,r){if(!o.isString(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var s=t.indexOf("?"),a=-1!==s&&s<t.indexOf("#")?"?":"#",u=t.split(a);u[0]=u[0].replace(/\\/g,"/");var b=t=u.join(a);if(b=b.trim(),!r&&1===t.split("#").length){var w=h.exec(b);if(w)return this.path=b,this.href=b,this.pathname=w[1],w[2]?(this.search=w[2],this.query=e?y.parse(this.search.substr(1)):this.search.substr(1)):e&&(this.search="",this.query={}),this}var j=i.exec(b);if(j){var x=(j=j[0]).toLowerCase();this.protocol=x,b=b.substr(j.length)}if(r||j||b.match(/^\/\/[^@\/]+@[^@\/]+/)){var O="//"===b.substr(0,2);!O||j&&d[j]||(b=b.substr(2),this.slashes=!0)}if(!d[j]&&(O||j&&!g[j])){for(var A,C,T=-1,q=0;q<f.length;q++){-1!==(I=b.indexOf(f[q]))&&(-1===T||I<T)&&(T=I)}-1!==(C=-1===T?b.lastIndexOf("@"):b.lastIndexOf("@",T))&&(A=b.slice(0,C),b=b.slice(C+1),this.auth=decodeURIComponent(A)),T=-1;for(q=0;q<l.length;q++){var I;-1!==(I=b.indexOf(l[q]))&&(-1===T||I<T)&&(T=I)}-1===T&&(T=b.length),this.host=b.slice(0,T),b=b.slice(T),this.parseHost(),this.hostname=this.hostname||"";var k="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!k)for(var U=this.hostname.split(/\./),_=(q=0,U.length);q<_;q++){var R=U[q];if(R&&!R.match(p)){for(var S="",P=0,E=R.length;P<E;P++)R.charCodeAt(P)>127?S+="x":S+=R[P];if(!S.match(p)){var L=U.slice(0,q),N=U.slice(q+1),z=R.match(m);z&&(L.push(z[1]),N.unshift(z[2])),N.length&&(b="/"+N.join(".")+b),this.hostname=L.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),k||(this.hostname=n.toASCII(this.hostname));var F=this.port?":"+this.port:"",M=this.hostname||"";this.host=M+F,this.href+=this.host,k&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==b[0]&&(b="/"+b))}if(!v[x])for(q=0,_=c.length;q<_;q++){var $=c[q];if(-1!==b.indexOf($)){var D=encodeURIComponent($);D===$&&(D=escape($)),b=b.split($).join(D)}}var H=b.indexOf("#");-1!==H&&(this.hash=b.substr(H),b=b.slice(0,H));var K=b.indexOf("?");if(-1!==K?(this.search=b.substr(K),this.query=b.substr(K+1),e&&(this.query=y.parse(this.query)),b=b.slice(0,K)):e&&(this.search="",this.query={}),b&&(this.pathname=b),g[x]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){F=this.pathname||"";var Z=this.search||"";this.path=F+Z}return this.href=this.format(),this},s.prototype.format=function(){var t=this.auth||"";t&&(t=(t=encodeURIComponent(t)).replace(/%3A/i,":"),t+="@");var e=this.protocol||"",r=this.pathname||"",n=this.hash||"",s=!1,i="";this.host?s=t+this.host:this.hostname&&(s=t+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(s+=":"+this.port)),this.query&&o.isObject(this.query)&&Object.keys(this.query).length&&(i=y.stringify(this.query));var a=this.search||i&&"?"+i||"";return e&&":"!==e.substr(-1)&&(e+=":"),this.slashes||(!e||g[e])&&!1!==s?(s="//"+(s||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):s||(s=""),n&&"#"!==n.charAt(0)&&(n="#"+n),a&&"?"!==a.charAt(0)&&(a="?"+a),e+s+(r=r.replace(/[?#]/g,function(t){return encodeURIComponent(t)}))+(a=a.replace("#","%23"))+n},s.prototype.resolve=function(t){return this.resolveObject(b(t,!1,!0)).format()},s.prototype.resolveObject=function(t){if(o.isString(t)){var e=new s;e.parse(t,!1,!0),t=e}for(var r=new s,n=Object.keys(this),i=0;i<n.length;i++){var a=n[i];r[a]=this[a]}if(r.hash=t.hash,""===t.href)return r.href=r.format(),r;if(t.slashes&&!t.protocol){for(var h=Object.keys(t),u=0;u<h.length;u++){var c=h[u];"protocol"!==c&&(r[c]=t[c])}return g[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(t.protocol&&t.protocol!==r.protocol){if(!g[t.protocol]){for(var l=Object.keys(t),f=0;f<l.length;f++){var p=l[f];r[p]=t[p]}return r.href=r.format(),r}if(r.protocol=t.protocol,t.host||d[t.protocol])r.pathname=t.pathname;else{for(var m=(t.pathname||"").split("/");m.length&&!(t.host=m.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==m[0]&&m.unshift(""),m.length<2&&m.unshift(""),r.pathname=m.join("/")}if(r.search=t.search,r.query=t.query,r.host=t.host||"",r.auth=t.auth,r.hostname=t.hostname||t.host,r.port=t.port,r.pathname||r.search){var v=r.pathname||"",y=r.search||"";r.path=v+y}return r.slashes=r.slashes||t.slashes,r.href=r.format(),r}var b=r.pathname&&"/"===r.pathname.charAt(0),w=t.host||t.pathname&&"/"===t.pathname.charAt(0),j=w||b||r.host&&t.pathname,x=j,O=r.pathname&&r.pathname.split("/")||[],A=(m=t.pathname&&t.pathname.split("/")||[],r.protocol&&!g[r.protocol]);if(A&&(r.hostname="",r.port=null,r.host&&(""===O[0]?O[0]=r.host:O.unshift(r.host)),r.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===m[0]?m[0]=t.host:m.unshift(t.host)),t.host=null),j=j&&(""===m[0]||""===O[0])),w)r.host=t.host||""===t.host?t.host:r.host,r.hostname=t.hostname||""===t.hostname?t.hostname:r.hostname,r.search=t.search,r.query=t.query,O=m;else if(m.length)O||(O=[]),O.pop(),O=O.concat(m),r.search=t.search,r.query=t.query;else if(!o.isNullOrUndefined(t.search)){if(A)r.hostname=r.host=O.shift(),(k=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=k.shift(),r.host=r.hostname=k.shift());return r.search=t.search,r.query=t.query,o.isNull(r.pathname)&&o.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!O.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var C=O.slice(-1)[0],T=(r.host||t.host||O.length>1)&&("."===C||".."===C)||""===C,q=0,I=O.length;I>=0;I--)"."===(C=O[I])?O.splice(I,1):".."===C?(O.splice(I,1),q++):q&&(O.splice(I,1),q--);if(!j&&!x)for(;q--;q)O.unshift("..");!j||""===O[0]||O[0]&&"/"===O[0].charAt(0)||O.unshift(""),T&&"/"!==O.join("/").substr(-1)&&O.push("");var k,U=""===O[0]||O[0]&&"/"===O[0].charAt(0);A&&(r.hostname=r.host=U?"":O.length?O.shift():"",(k=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=k.shift(),r.host=r.hostname=k.shift()));return(j=j||r.host&&O.length)&&!U&&O.unshift(""),O.length?r.pathname=O.join("/"):(r.pathname=null,r.path=null),o.isNull(r.pathname)&&o.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=t.auth||r.auth,r.slashes=r.slashes||t.slashes,r.href=r.format(),r},s.prototype.parseHost=function(){var t=this.host,e=a.exec(t);e&&(":"!==(e=e[0])&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},function(t,e,r){(function(t,n){var o;/*! https://mths.be/punycode v1.4.1 by @mathias */!function(s){e&&e.nodeType,t&&t.nodeType;var i="object"==typeof n&&n;i.global!==i&&i.window!==i&&i.self;var a,h=2147483647,u=36,c=1,l=26,f=38,p=700,m=72,v=128,d="-",g=/^xn--/,y=/[^\x20-\x7E]/,b=/[\x2E\u3002\uFF0E\uFF61]/g,w={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},j=u-c,x=Math.floor,O=String.fromCharCode;function A(t){throw new RangeError(w[t])}function C(t,e){for(var r=t.length,n=[];r--;)n[r]=e(t[r]);return n}function T(t,e){var r=t.split("@"),n="";return r.length>1&&(n=r[0]+"@",t=r[1]),n+C((t=t.replace(b,".")).split("."),e).join(".")}function q(t){for(var e,r,n=[],o=0,s=t.length;o<s;)(e=t.charCodeAt(o++))>=55296&&e<=56319&&o<s?56320==(64512&(r=t.charCodeAt(o++)))?n.push(((1023&e)<<10)+(1023&r)+65536):(n.push(e),o--):n.push(e);return n}function I(t){return C(t,function(t){var e="";return t>65535&&(e+=O((t-=65536)>>>10&1023|55296),t=56320|1023&t),e+=O(t)}).join("")}function k(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function U(t,e,r){var n=0;for(t=r?x(t/p):t>>1,t+=x(t/e);t>j*l>>1;n+=u)t=x(t/j);return x(n+(j+1)*t/(t+f))}function _(t){var e,r,n,o,s,i,a,f,p,g,y,b=[],w=t.length,j=0,O=v,C=m;for((r=t.lastIndexOf(d))<0&&(r=0),n=0;n<r;++n)t.charCodeAt(n)>=128&&A("not-basic"),b.push(t.charCodeAt(n));for(o=r>0?r+1:0;o<w;){for(s=j,i=1,a=u;o>=w&&A("invalid-input"),((f=(y=t.charCodeAt(o++))-48<10?y-22:y-65<26?y-65:y-97<26?y-97:u)>=u||f>x((h-j)/i))&&A("overflow"),j+=f*i,!(f<(p=a<=C?c:a>=C+l?l:a-C));a+=u)i>x(h/(g=u-p))&&A("overflow"),i*=g;C=U(j-s,e=b.length+1,0==s),x(j/e)>h-O&&A("overflow"),O+=x(j/e),j%=e,b.splice(j++,0,O)}return I(b)}function R(t){var e,r,n,o,s,i,a,f,p,g,y,b,w,j,C,T=[];for(b=(t=q(t)).length,e=v,r=0,s=m,i=0;i<b;++i)(y=t[i])<128&&T.push(O(y));for(n=o=T.length,o&&T.push(d);n<b;){for(a=h,i=0;i<b;++i)(y=t[i])>=e&&y<a&&(a=y);for(a-e>x((h-r)/(w=n+1))&&A("overflow"),r+=(a-e)*w,e=a,i=0;i<b;++i)if((y=t[i])<e&&++r>h&&A("overflow"),y==e){for(f=r,p=u;!(f<(g=p<=s?c:p>=s+l?l:p-s));p+=u)C=f-g,j=u-g,T.push(O(k(g+C%j,0))),f=x(C/j);T.push(O(k(f,0))),s=U(r,w,n==o),r=0,++n}++r,++e}return T.join("")}a={version:"1.4.1",ucs2:{decode:q,encode:I},decode:_,encode:R,toASCII:function(t){return T(t,function(t){return y.test(t)?"xn--"+R(t):t})},toUnicode:function(t){return T(t,function(t){return g.test(t)?_(t.slice(4).toLowerCase()):t})}},void 0===(o=function(){return a}.call(e,r,e,t))||(t.exports=o)}()}).call(this,r(6)(t),r(7))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e,r){"use strict";t.exports={isString:function(t){return"string"==typeof t},isObject:function(t){return"object"==typeof t&&null!==t},isNull:function(t){return null===t},isNullOrUndefined:function(t){return null==t}}},function(t,e,r){"use strict";e.decode=e.parse=r(10),e.encode=e.stringify=r(11)},function(t,e,r){"use strict";function n(t,e){return Object.prototype.hasOwnProperty.call(t,e)}t.exports=function(t,e,r,s){e=e||"&",r=r||"=";var i={};if("string"!=typeof t||0===t.length)return i;var a=/\+/g;t=t.split(e);var h=1e3;s&&"number"==typeof s.maxKeys&&(h=s.maxKeys);var u=t.length;h>0&&u>h&&(u=h);for(var c=0;c<u;++c){var l,f,p,m,v=t[c].replace(a,"%20"),d=v.indexOf(r);d>=0?(l=v.substr(0,d),f=v.substr(d+1)):(l=v,f=""),p=decodeURIComponent(l),m=decodeURIComponent(f),n(i,p)?o(i[p])?i[p].push(m):i[p]=[i[p],m]:i[p]=m}return i};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},function(t,e,r){"use strict";var n=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};t.exports=function(t,e,r,a){return e=e||"&",r=r||"=",null===t&&(t=void 0),"object"==typeof t?s(i(t),function(i){var a=encodeURIComponent(n(i))+r;return o(t[i])?s(t[i],function(t){return a+encodeURIComponent(n(t))}).join(e):a+encodeURIComponent(n(t[i]))}).join(e):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(t)):""};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function s(t,e){if(t.map)return t.map(e);for(var r=[],n=0;n<t.length;n++)r.push(e(t[n],n));return r}var i=Object.keys||function(t){var e=[];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.push(r);return e}}]);