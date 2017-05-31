/** 
 * 필요 라이브러리 : 
 *  - jQuery.js
 *  - G1sUtil.js : 
 *    https://github.com/g1s/blog.g1s.kr/blob/master/G1sBlog/common/js/G1sUtil.js 
 * 
 * https://github.com/g1s/blog.g1s.kr/blob/master/G1sBlog/common/js/G1sBlogger.js 
 **/

var G1sBlogger = new function() {
  var r = { version : '1.0.0.0' };
  r.feed = {};
  function getFeedLink() {
    var link = $('link');
    for (var i = 0; i < link.length; i++) {
      if (link[i].rel == 'service.post') {
        r.feed.post = link[i].href;
        r.blogId = r.feed.post.split('/')[4];
      } else if (link[i].href.endsWith('/comments/default')) {
        r.feed.comment = link[i].href;
        r.postId = r.feed.comment.split('/')[4];
      }
    }
  }
  getFeedLink();

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
  
  r.getFeedReq = function(u){
    return new function(u){
      var o = {};
      var _o = {
        protocol : '',
        host : '',
        type : 'posts',  /* posts, comments */
        range : 'summary',  /* summary, default */
        tag : '',
        alt : 'json',
        param : {}
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

      o.setTag = function(s){
        return _o.tag = G1sUtil.isEmpty(s)?'':s, o;
      }
      
      o.setResult = function(s){
    	  return _o.alt = G1sUtil.isEmpty(s)?'json':s, o;
      }
      
      o.setParam = function(k, v){
        return _o.param[k] = v, o;
      }
      
      o.removeParam = function(k){
        return _o.param[k] = undefined, delete _o.param[k], o;
      }
      
      o.getUrl = function(){
        var protocol = location.href.startsWith('https://')?'https':
          G1sUtil.isEmpty(_o.protocol)?'http':_o.protocol;
        var param = '';
        for(var k in _o.param){
          param += '&' + k + '=' + _o.param[k];
        }
        return protocol + '://' + (G1sUtil.isEmpty(_o.host)?location.href.split('/')[2]:_o.host)
          + '/feeds/'+ _o.type + '/' + _o.range
          + (G1sUtil.isEmpty(_o.tag)?'':('/-/'+_o.tag))
          + '?alt=' + _o.alt
          + param;
      }
      
      o.submit = function(s){
        $.ajax({
           type : "GET",
           url : o.getUrl(),
           success : s
        });
      }
      
      return o;
    };
  }
  
  return r;
}