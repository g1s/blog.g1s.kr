/** 필요 라이브러리 : 
 *  - jQuery.js
 *  - angular.js : https://ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular.min.js
 *  - G1sUtil.js : https://github.com/g1s/blog.g1s.kr/tree/master/G1sBlog/common/js/G1sUtil.js 
 **/

var G1sBlogger = new function() {
  var r = { version : '1.0.3.0' };
  r.link = getFeedLink();
  r.app = angular.module('app', []);
  
  function getFeedLink() {
    var l = {}; 
    var link = $('link');
    for (var i = 0; i < link.length; i++) {
      if (link[i].rel == 'service.post') {
        l.post = link[i].href;
        r.blogId = l.post.split('/')[4];
      } else if (link[i].href.endsWith('/comments/default')) {
        l.comment = link[i].href;
        r.postId = l.comment.split('/')[4];
      }
    }
    return l;
  }

  r.isAdmin = function() {
    return ($('span.blog-admin').css('display') != 'none')
  }

  /** Feed Parser * */
  function getEntry(o, i) {
    return (G1sUtil.isEmpty(i)) ? o : o.feed.entry[i];
  }

  r.getPostUrl = function(o, i) {
    var entry = getEntry(o, i);
    for ( var i in entry.link) {
      if (entry.link[i].rel == 'alternate') {
        return entry.link[i].href;
      }
    }
    return null;
  }
  
  r.getImgUrl = function(o, i, s) {
    var img = getEntry(o, i).media$thumbnail.url;
    if (!G1sUtil.isEmpty(s)) {
      var sp = img.split('/');
      sp[sp.length - 2] = s;
      img = sp.join('/');
    }
    return img;
  }
  
  /* blogger feed requester */
  r.feed = function(u){
    return new function(u){
      var o = {};
      var _o = {
        protocol : '',
        host : '',
        type : 'posts',  /* posts, comments */
        range : 'summary',  /* summary, default */
        tag : '',
        param : { }
      };

      o.setHost = function(u){
        if(u.includes('://')){
          var t = u.split('://');
          _o.protocol = t[0];
          u = t[1]
        }
        return _o.host = u.split('/')[0], o;
      }
      
      o.setType = function(s){
        return _o.type = (G1sUtil.isEmpty(s)||s.startsWith('post'))?'posts':
          s.startsWith('comment')?'comments':s, o;
      }
      
      o.setRange = function(s){
        return _o.range = (G1sUtil.isEmpty(s)||s.startsWith('summary'))?
            'summary':s.startsWith('default')?'default':s, o;
      }

      o.setLabel = function(s){
        return _o.label = G1sUtil.isEmpty(s)?'':s, o;
      }
      
      o.setResult = function(s){
    	  return o.setParam('alt',G1sUtil.isEmpty(s)?'json':s), o;
      }

      o.setStart = function(s){
        return o.setParam('start-index',s), o;
      }
      
      o.setMax = function(s){
        return o.setParam('max-results',s), o;
      }

      o.setPublished = function(s, e){
        return o.setParam('published-min',s), o.setParam('published-max',e), o;
      }

      o.setUpdated = function(s, e){
        return o.setParam('update-min',s), o.setParam('update-max',e), o;
      }

      o.setOrderby = function(s){
        return o.setParam('orderby',s), o;
      }
      
      o.setParam = function(k, v){
        return _o.param[k] = v, o;
      }
      
      o.removeParam = function(k){
        return _o.param[k] = undefined, delete _o.param[k], o;
      }

      o.getUrl = function(){
        var protocol = location.href.startsWith('https://')?'https':G1sUtil.isEmpty(_o.protocol)?'http':_o.protocol;
        var param = '';
        for(var k in _o.param){
          if(!G1sUtil.isEmpty(_o.param[k])){
            param += k + '=' + _o.param[k] + '&';
          }
        }
        return protocol + '://' + (G1sUtil.isEmpty(_o.host)?location.href.split('/')[2]:_o.host)
          + '/feeds/'+ _o.type + '/' + _o.range
          + (G1sUtil.isEmpty(_o.label)?'':('/-/'+_o.label))
          + '?' + param;
      }
      
      o.request = function(s){
        $.ajax({
           type : "GET",
           url : o.getUrl(),
           success : s
        });
      }
      
      o.setResult();
      return o;
    };
  }

  r.angual = function(){ return r.app; }
  
  return r;
}