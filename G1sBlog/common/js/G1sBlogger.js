/**
 * 
 */

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
	}, r.getImgUrl = function(o, i, s) {
		var img = getEntry(o, i).media$thumbnail.url;
		if (!G1sUtil.isEmpty(s)) {
			var sp = img.split('/');
			sp[sp.length - 2] = s;
			img = sp.join('/');
		}
		return img;
	}

	return r;
}