var _ = require('lodash')
  , rss = require('../lib/apps/aggregations/providers/rss');

var members = [
  { "name": "Football Fancast", "type": "publisher", "accounts": [ { "link": "http://www.footballfancast.com/feed", "network": "rss" } ] }
, { "name": "Rugby Drum", "type": "publisher", "accounts": [ { "link": "http://www.therugbydrum.com/feed", "network": "rss" } ] }
, { "name": "Old Trafford Reds", "type": "publisher", "accounts": [ { "link": "http://www.oldtraffordreds.co.uk/feed", "network": "rss" } ] }
, { "name": "Football League World", "type": "publisher", "accounts": [ { "link": "http://www.footballleagueworld.co.uk/feed", "network": "rss" } ] }
, { "name": "The Gooner", "type": "publisher", "accounts": [ { "link": "http://www.thegooner.com/feed", "network": "rss" } ] }
, { "name": "Our Kop", "type": "publisher", "accounts": [ { "link": "http://www.ourkop.com/feed", "network": "rss" } ] }
, { "name": "Arsenal Mania", "type": "publisher", "accounts": [ { "link": "http://www.arsenal-mania.com/feed", "network": "rss" } ] }
, { "name": "Chelsea Fancast", "type": "publisher", "accounts": [ { "link": "http://www.chelseafancast.com/feed", "network": "rss" } ] }
, { "name": "Football Journalist", "type": "publisher", "accounts": [ { "link": "http://www.thefootballjournalist.com/feed", "network": "rss" } ] }
, { "name": "Forever West Ham", "type": "publisher", "accounts": [ { "link": "http://www.foreverwestham.com/feed", "network": "rss" } ] }
, { "name": "Nothing But Newcastle", "type": "publisher", "accounts": [ { "link": "http://www.nothingbutnewcastle.com/feed", "network": "rss" } ] }
, { "name": "Red Flag Flying High", "type": "publisher", "accounts": [ { "link": "http://www.redflagflyinghigh.com/feed", "network": "rss" } ] }
, { "name": "Gunnersphere", "type": "publisher", "accounts": [ { "link": "http://www.gunnersphere.com/feed", "network": "rss" } ] }
, { "name": "The Shed Ender", "type": "publisher", "accounts": [ { "link": "http://www.theshedender.com/feed", "network": "rss" } ] }
, { "name": "Forza Italian Football", "type": "publisher", "accounts": [ { "link": "http://www.forzaitalianfootball.com/feed", "network": "rss" } ] }
, { "name": "The Hotspur Way", "type": "publisher", "accounts": [ { "link": "http://www.thehotspurway.com/feed", "network": "rss" } ] }
, { "name": "The Celtic Blog", "type": "publisher", "accounts": [ { "link": "http://www.thecelticblog.com/feed", "network": "rss" } ] }
, { "name": "Video Celts", "type": "publisher", "accounts": [ { "link": "http://www.videocelts.com/feed", "network": "rss" } ] }
, { "name": "The Busby Way", "type": "publisher", "accounts": [ { "link": "http://www.thebusbyway.com/feed", "network": "rss" } ] }
, { "name": "This Is Futbol", "type": "publisher", "accounts": [ { "link": "http://www.thisisfutbol.com/feed", "network": "rss" } ] }
, { "name": "Live For Liverpool", "type": "publisher", "accounts": [ { "link": "http://www.live4liverpool.com/feed", "network": "rss" } ] }
, { "name": "The Football Transfer Tavern", "type": "publisher", "accounts": [ { "link": "http://www.footballtransfertavern.com/feed", "network": "rss" } ] }
, { "name": "BBC Sport", "type": "publisher", "accounts": [ { "link": "http://feeds.bbci.co.uk/sport/football/rss.xml?edition=uk", "network": "rss" } ] }
, { "name": "The Guardian", "type": "publisher", "accounts": [ { "link": "https://www.theguardian.com/football/rss", "network": "rss" } ] }
, { "name": "The Independent", "type": "publisher", "accounts": [ { "link": "http://www.independent.co.uk/sport/football/rss", "network": "rss" } ] }
, { "name": "World Soccer", "type": "publisher", "accounts": [ { "link": "http://www.worldsoccer.com/feed", "network": "rss" } ] }
, { "name": "Blue Moon", "type": "publisher", "accounts": [ { "link": "http://bluemoon-mcfc.co.uk/News/Feed.aspx", "network": "rss" } ] }
, { "name": "The Evening Standard", "type": "publisher", "accounts": [ { "link": "http://www.standard.co.uk/sport/football/rss", "network": "rss" } ] }
, { "name": "Fresh Arsenal", "type": "publisher", "accounts": [ { "link": "http://fresharsenal.com/feed/", "network": "rss" } ] }
, { "name": "North London Is Red", "type": "publisher", "accounts": [ { "link": "http://northlondonisred.co.uk/feed/", "network": "rss" } ] }
, { "name": "Telegraph", "type": "publisher", "accounts": [ { "link": "http://www.telegraph.co.uk/football/rss.xml", "network": "rss" } ] }
, { "name": "Talksport", "type": "publisher", "accounts": [ { "link": "http://talksport.com/rss/sports-news/football/feed", "network": "rss" } ] }
, { "name": "Daily Mail", "type": "publisher", "accounts": [ { "link": "http://www.dailymail.co.uk/sport/index.rss", "network": "rss" } ] }
, { "name": "The Sun", "type": "publisher", "accounts": [ { "link": "http://www.thesundaily.my/rss/sports", "network": "rss" } ] }
, { "name": "ESPN Football", "type": "publisher", "accounts": [ { "link": "http://www.espn.co.uk/espn/rss/football/news", "network": "rss" } ] }
, { "name": "FIFA", "type": "publisher", "accounts": [ { "link": "http://www.fifa.com/rss/index.xml", "network": "rss" } ] }
, { "name": "Football Eye", "type": "publisher", "accounts": [ { "link": "http://www.eyefootball.com/football_news.xml", "network": "rss" } ] }
, { "name": "UEFA", "type": "publisher", "accounts": [ { "link": "http://www.uefa.com/rssfeed/news/rss.xml", "network": "rss" } ] }
, { "name": "Arseblog", "type": "publisher", "accounts": [ { "link": "http://arseblog.com/feed/", "network": "rss" } ] }
, { "name": "The Anfield Wrap", "type": "publisher", "accounts": [ { "link": "http://www.theanfieldwrap.com/feed/", "network": "rss" } ] }
, { "name": "The Fighting Cock", "type": "publisher", "accounts": [ { "link": "http://www.thefightingcock.co.uk/feed/", "network": "rss" } ] }
, { "name": "Daily Star", "type": "publisher", "accounts": [ { "link": "http://feeds.feedburner.com/daily-star-football", "network": "rss" } ] }
, { "name": "Freestyle Football", "type": "publisher", "accounts": [ { "link": "http://freestylefootball.org/feed/", "network": "rss" } ] }
, { "name": "The People's Person", "type": "publisher", "accounts": [ { "link": "http://thepeoplesperson.com/feed/", "network": "rss" } ] }
, { "name": "A Grand Old Team", "type": "publisher", "accounts": [ { "link": "https://www.grandoldteam.com/feed/", "network": "rss" } ] }
, { "name": "Knees Up Mother Brown", "type": "publisher", "accounts": [ { "link": "http://kumb.com/rss.php", "network": "rss" } ] }
, { "name": "Football.co.uk", "type": "publisher", "accounts": [ { "link": "http://www.football.co.uk/news/rss.xml", "network": "rss" } ] }
, { "name": "Cheekysport.co.uk", "type": "publisher", "accounts": [ { "link": "http://cheekysport.com/feed/", "network": "rss" } ] }
, { "name": "Whoscored.com", "type": "publisher", "accounts": [ { "link": "https://www.whoscored.com/rss", "network": "rss" } ] }
, { "name": "Fantasy Football Scout", "type": "publisher", "accounts": [ { "link": "http://www.fantasyfootballscout.co.uk/feed/", "network": "rss" } ] }
, { "name": "Football Insider 247", "type": "publisher", "accounts": [ { "link": "http://www.footballinsider247.com/feed/", "network": "rss" } ] }
, { "name": "Andrew Henderson", "type": "publisher", "accounts": [ { "link": "http://www.ahfreestyle.co.uk/about-andrew/feed/", "network": "rss" } ] }
, { "name": "Sports Dictator", "type": "publisher", "accounts": [ { "link": "http://sportsdictator.com/feed/", "network": "rss" } ] }
, { "name": "The Boot Room", "type": "publisher", "accounts": [ { "link": "http://tbrfootball.com/feed/", "network": "rss" } ] }
, { "name": "Sky Sports", "type": "publisher", "accounts": [ { "link": "http://www.skysports.com/rss/11095", "network": "rss" } ] }
, { "name": "Bleacher Report", "type": "publisher", "accounts": [ { "link": "http://bleacherreport.com/articles/feed?tag_id=56", "network": "rss" } ] }

];

members = [ 
  { "name": "World Soccer", "type": "publisher", "accounts": [ { "link": "http://www.worldsoccer.com/feed", "network": "rss" } ] }
];

var links = _.chain(members).map('accounts').flatten().value();

links.forEach(function(link) {
  rss(link).then(function(posts) {
    _.forEach(posts, function(post) {
      console.log(post);
    });
  });
});


