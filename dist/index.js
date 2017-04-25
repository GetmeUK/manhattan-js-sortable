!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ManhattanSortable=t():e.ManhattanSortable=t()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.loaded=!0,o.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){r(1),e.exports=r(2)},function(e,t,r){e.exports=r.p+"sortable.css"},function(e,t,r){var o,i,n=function(e,t){return function(){return e.apply(t,arguments)}};o=r(3),i=function(){function Sortable(e,t){var r;null==t&&(t={}),this._grab=n(this._grab,this),this._drop=n(this._drop,this),this._drag=n(this._drag,this),o.config(this,{axis:"vertical",childSelector:null,grabSelector:null},t,e,this.constructor.clsPrefix),this._behaviours={},o.config(this._behaviours,{before:"auto",children:"children",grabber:"self",helper:"clone"},t,e,this.constructor.clsPrefix),this._grabbed=null,this._grabbedOffset=null,this._dom={},this._dom.container=e,this._dom.container.__mh_sortable=this,this._dom.container.classList.add(this._bem("mh-sortable")),Object.defineProperty(this,"container",{value:this._dom.container}),Object.defineProperty(this,"children",{get:function(e){return function(){var t;return function(){var e,r,o,i;for(o=this._dom.children,i=[],e=0,r=o.length;e<r;e++)t=o[e],i.push(t);return i}.call(e)}}(this)}),r=this.constructor.behaviours.children[this._behaviours.children],this._dom.children=r(this),o.listen(document,{mousedown:this._grab,mousemove:this._drag,mouseup:this._drop,touchstart:this._grab,touchmove:this._drag,touchend:this._drop})}return Sortable.clsPrefix="data-mh-sortable--",Sortable.prototype.destroy=function(){return this.container.classList.remove(this._bem("mh-sortable")),o.ignore(document,{mousedown:this._grab,mousemove:this._drag,mouseup:this._drop,touchstart:this._grab,touchmove:this._drag,touchend:this._drop}),delete this._dom.container.__mh_sortable},Sortable.prototype._bem=function(e,t,r){var o;return null==t&&(t=""),null==r&&(r=""),o=e,t&&(o=o+"__"+t),r&&(o=o+"--"+r),o},Sortable.prototype._clearSelection=function(){},Sortable.prototype._et=function(e){return"mh-sortable--"+e},Sortable.prototype._getEventPos=function(e){return e.touches&&(e=e.touches[0]),[e.pageX-window.pageXOffset,e.pageY-window.pageYOffset]},Sortable.prototype._drag=function(e){var t,r,i,n,s,a,h,u,c,l;if(this._grabbed){for(h=this._getEventPos(e),a=[window.pageXOffset,window.pageYOffset],this._dom.helper.style.left=a[0]+h[0]-this._grabbedOffset[0]+"px",this._dom.helper.style.top=a[1]+h[1]-this._grabbedOffset[1]+"px",l=document.elementFromPoint(h[0],h[1]),c=null,u=this._dom.children,n=0,s=u.length;n<s;n++)if(r=u[n],r!==this._grabbed&&r.contains(l)){c=r;break}if(c)return t=this.constructor.behaviours.before[this._behaviours.before],t=t(this,c,h),this.container.removeChild(this._grabbed),t||(c=c.nextElementSibling),this.container.insertBefore(this._grabbed,c),i=this.constructor.behaviours.children[this._behaviours.children],this._dom.children=i(this),o.dispatch(this.container,this._et("sort"),{children:this._dom.children})}},Sortable.prototype._drop=function(e){if(this._grabbed)return this._grabbed.classList.remove(this._bem("mh-sortable-ghost")),this._grabbed=null,this._grabbedOffset=null,document.body.removeChild(this._dom.helper),this._dom.helper=null,this.container.classList.remove(this._bem("mh-sortable",null,"sorting")),o.dispatch(this.container,this._et("sorted"),{children:this._dom.children})},Sortable.prototype._grab=function(e){var t,r,i,n,s,a,h,u,c;if("mousedown"!==e.type.toLowerCase()||1===e.which){for(r=null,c=this._dom.children,s=0,a=c.length;s<a;s++)if(t=c[s],i=this.constructor.behaviours.grabber[this._behaviours.grabber],i(this,t).contains(e.target)){r=t;break}return r?(e.preventDefault(),this._grabbed=r,h=this._getEventPos(e),u=this._grabbed.getBoundingClientRect(),this._grabbedOffset=[h[0]-u.left,h[1]-u.top],n=this.constructor.behaviours.helper[this._behaviours.helper],this._dom.helper=n(this,this._grabbed),document.body.appendChild(this._dom.helper),this._dom.helper.style.left=h[0]-this._grabbedOffset[0]+"px",this._dom.helper.style.top=h[1]-this._grabbedOffset[1]+"px",this._grabbed.classList.add(this._bem("mh-sortable-ghost")),this.container.classList.add(this._bem("mh-sortable",null,"sorting")),o.dispatch(this.container,this._et("grabbed"),{child:r})):void 0}},Sortable.behaviours={before:{auto:function(e,t,r){var o,i,n,s,a,h,u,c;if(c=e.container.getBoundingClientRect().width,e._containerWidth!==c){for(e.axis="vertical",u={},a=e._dom.children,n=0,s=a.length;n<s;n++){if(i=a[n],h=i.getBoundingClientRect().top,u[h]){e.axis="horizontal";break}u[h]=!0}e._containerWidth=c}return(o=e.constructor.behaviours.before.axis)(e,t,r)},axis:function(e,t,r){var o,i;return i=t.getBoundingClientRect(),o=[r[0]-i.left,r[1]-i.top],"vertical"===e.axis?o[1]<i.height/2:o[0]<i.width/2}},children:{children:function(e){var t,r,o;return t=e.container.childNodes,o=1,function(){var e,i,n;for(n=[],e=0,i=t.length;e<i;e++)r=t[e],r.nodeType===o&&n.push(r);return n}()},selector:function(e){return o.many(e.childSelector,e.container)}},grabber:{selector:function(e,t){return o.one(e.grabSelector,t)},self:function(e,t){return t}},helper:{clone:function(e,t){var r,o;return r=t.cloneNode(!0),r.removeAttribute("id"),r.removeAttribute("name"),o=document.defaultView.getComputedStyle(t,"").cssText,r.style.cssText=o,r.style.position="absolute",r.style["pointer-events"]="none",r.classList.add(e._bem("mh-sortable-helper")),r}}},Sortable}(),e.exports={Sortable:i}},function(e,t,r){!function(t,r){e.exports=r()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.loaded=!0,o.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){e.exports=r(1)},function(e,t){var r,o,i,n,s,a,h,u,c=[].indexOf||function(e){for(var t=0,r=this.length;t<r;t++)if(t in this&&this[t]===e)return t;return-1};o=function(e,t){var r,o,i;null==t&&(t={}),r=document.createElement(e);for(o in t)i=t[o],c.call(r,o)>=0?r[o]=i:r.setAttribute(o,i);return r},h=function(e,t){return null==t&&(t=document),Array.prototype.slice.call(t.querySelectorAll(e))},u=function(e,t){return null==t&&(t=document),t.querySelector(e)},i=function(e,t,r){var o,i,n;null==r&&(r={}),o=document.createEvent("Event"),o.initEvent(t,!0,!0);for(i in r)n=r[i],o[i]=n;return e.dispatchEvent(o)},s=function(e,t){var r,o,i,n;n=[];for(o in t)i=t[o],n.push(function(){var t,n,s,a;for(s=o.split(/\s+/),a=[],t=0,n=s.length;t<n;t++)r=s[t],a.push(e.removeEventListener(r,i));return a}());return n},a=function(e,t){var r,o,i,n;n=[];for(o in t)i=t[o],n.push(function(){var t,n,s,a;for(s=o.split(/\s+/),a=[],t=0,n=s.length;t<n;t++)r=s[t],a.push(e.addEventListener(r,i));return a}());return n},r=function(e,t,r,o,i){var n,s,a,h;null==i&&(i="data-"),a=[];for(s in t)h=t[s],e[s]=h,r.hasOwnProperty(s)&&(e[s]=r[s]),n=i+s.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),o.hasAttribute(n)?"number"==typeof h?a.push(e[s]=parseInt(o.getAttribute(n))):h===!1?a.push(e[s]=!0):a.push(e[s]=o.getAttribute(n)):a.push(void 0);return a},n=function(e){return e.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g,"\\$&")},e.exports={create:o,one:u,many:h,dispatch:i,ignore:s,listen:a,config:r,escapeRegExp:n}}])})}])});