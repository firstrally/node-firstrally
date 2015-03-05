/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2015
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
'use strict';(function(J){function w(a,b,c){var f=0,g=[0],l="",h=null,l=c||"UTF8";if("UTF8"!==l&&"UTF16BE"!==l&&"UTF16LE"!==l)throw"encoding must be UTF8, UTF16BE, or UTF16LE";if("HEX"===b){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";h=y(a);f=h.binLen;g=h.value}else if("TEXT"===b)h=z(a,l),f=h.binLen,g=h.value;else if("B64"===b)h=A(a),f=h.binLen,g=h.value;else if("BYTES"===b)h=B(a),f=h.binLen,g=h.value;else throw"inputFormat must be HEX, TEXT, B64, or BYTES";this.getHash=
function(a,b,c,l){var h=null,d=g.slice(),n=f,p;3===arguments.length?"number"!==typeof c&&(l=c,c=1):2===arguments.length&&(c=1);if(c!==parseInt(c,10)||1>c)throw"numRounds must a integer >= 1";switch(b){case "HEX":h=D;break;case "B64":h=E;break;case "BYTES":h=F;break;default:throw"format must be HEX, B64, or BYTES";}if("SHA-384"===a)for(p=0;p<c;p+=1)d=u(d,n,a),n=384;else if("SHA-512"===a)for(p=0;p<c;p+=1)d=u(d,n,a),n=512;else throw"Chosen SHA variant is not supported";return h(d,G(l))};this.getHMAC=
function(a,b,c,h,m){var d,n,p,r,q=[],H=[];d=null;switch(h){case "HEX":h=D;break;case "B64":h=E;break;case "BYTES":h=F;break;default:throw"outputFormat must be HEX, B64, or BYTES";}if("SHA-384"===c)n=128,r=384;else if("SHA-512"===c)n=128,r=512;else throw"Chosen SHA variant is not supported";if("HEX"===b)d=y(a),p=d.binLen,d=d.value;else if("TEXT"===b)d=z(a,l),p=d.binLen,d=d.value;else if("B64"===b)d=A(a),p=d.binLen,d=d.value;else if("BYTES"===b)d=B(a),p=d.binLen,d=d.value;else throw"inputFormat must be HEX, TEXT, B64, or BYTES";
a=8*n;b=n/4-1;if(n<p/8){for(d=u(d,p,c);d.length<=b;)d.push(0);d[b]&=4294967040}else if(n>p/8){for(;d.length<=b;)d.push(0);d[b]&=4294967040}for(n=0;n<=b;n+=1)q[n]=d[n]^909522486,H[n]=d[n]^1549556828;c=u(H.concat(u(q.concat(g),a+f,c)),a+r,c);return h(c,G(m))}}function m(a,b){this.a=a;this.b=b}function z(a,b){var c=[],f,g=[],l=0,h,s,m;if("UTF8"===b)for(h=0;h<a.length;h+=1)for(f=a.charCodeAt(h),g=[],128>f?g.push(f):2048>f?(g.push(192|f>>>6),g.push(128|f&63)):55296>f||57344<=f?g.push(224|f>>>12,128|f>>>
6&63,128|f&63):(h+=1,f=65536+((f&1023)<<10|a.charCodeAt(h)&1023),g.push(240|f>>>18,128|f>>>12&63,128|f>>>6&63,128|f&63)),s=0;s<g.length;s+=1){for(m=l>>>2;c.length<=m;)c.push(0);c[m]|=g[s]<<24-l%4*8;l+=1}else if("UTF16BE"===b||"UTF16LE"===b)for(h=0;h<a.length;h+=1){f=a.charCodeAt(h);"UTF16LE"===b&&(s=f&255,f=s<<8|f>>8);for(m=l>>>2;c.length<=m;)c.push(0);c[m]|=f<<16-l%4*8;l+=2}return{value:c,binLen:8*l}}function y(a){var b=[],c=a.length,f,g,l;if(0!==c%2)throw"String of HEX type must be in byte increments";
for(f=0;f<c;f+=2){g=parseInt(a.substr(f,2),16);if(isNaN(g))throw"String of HEX type contains invalid characters";for(l=f>>>3;b.length<=l;)b.push(0);b[f>>>3]|=g<<24-f%8*4}return{value:b,binLen:4*c}}function B(a){var b=[],c,f,g;for(f=0;f<a.length;f+=1)c=a.charCodeAt(f),g=f>>>2,b.length<=g&&b.push(0),b[g]|=c<<24-f%4*8;return{value:b,binLen:8*a.length}}function A(a){var b=[],c=0,f,g,l,h,m;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";g=a.indexOf("=");a=a.replace(/\=/g,
"");if(-1!==g&&g<a.length)throw"Invalid '=' found in base-64 string";for(g=0;g<a.length;g+=4){m=a.substr(g,4);for(l=h=0;l<m.length;l+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(m[l]),h|=f<<18-6*l;for(l=0;l<m.length-1;l+=1){for(f=c>>>2;b.length<=f;)b.push(0);b[f]|=(h>>>16-8*l&255)<<24-c%4*8;c+=1}}return{value:b,binLen:8*c}}function D(a,b){var c="",f=4*a.length,g,l;for(g=0;g<f;g+=1)l=a[g>>>2]>>>8*(3-g%4),c+="0123456789abcdef".charAt(l>>>4&15)+"0123456789abcdef".charAt(l&
15);return b.outputUpper?c.toUpperCase():c}function E(a,b){var c="",f=4*a.length,g,l,h;for(g=0;g<f;g+=3)for(h=g+1>>>2,l=a.length<=h?0:a[h],h=g+2>>>2,h=a.length<=h?0:a[h],h=(a[g>>>2]>>>8*(3-g%4)&255)<<16|(l>>>8*(3-(g+1)%4)&255)<<8|h>>>8*(3-(g+2)%4)&255,l=0;4>l;l+=1)c=8*g+6*l<=32*a.length?c+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>>6*(3-l)&63):c+b.b64Pad;return c}function F(a){var b="",c=4*a.length,f,g;for(f=0;f<c;f+=1)g=a[f>>>2]>>>8*(3-f%4)&255,b+=String.fromCharCode(g);
return b}function G(a){var b={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(b.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(b.b64Pad=a.b64Pad)}catch(c){}if("boolean"!==typeof b.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof b.b64Pad)throw"Invalid b64Pad formatting option";return b}function q(a,b){var c=null,c=new m(a.a,a.b);return c=32>=b?new m(c.a>>>b|c.b<<32-b&4294967295,c.b>>>b|c.a<<32-b&4294967295):new m(c.b>>>b-32|c.a<<64-b&4294967295,
c.a>>>b-32|c.b<<64-b&4294967295)}function I(a,b){var c=null;return c=32>=b?new m(a.a>>>b,a.b>>>b|a.a<<32-b&4294967295):new m(0,a.a>>>b-32)}function K(a,b,c){return new m(a.a&b.a^~a.a&c.a,a.b&b.b^~a.b&c.b)}function L(a,b,c){return new m(a.a&b.a^a.a&c.a^b.a&c.a,a.b&b.b^a.b&c.b^b.b&c.b)}function M(a){var b=q(a,28),c=q(a,34);a=q(a,39);return new m(b.a^c.a^a.a,b.b^c.b^a.b)}function N(a){var b=q(a,14),c=q(a,18);a=q(a,41);return new m(b.a^c.a^a.a,b.b^c.b^a.b)}function O(a){var b=q(a,1),c=q(a,8);a=I(a,7);
return new m(b.a^c.a^a.a,b.b^c.b^a.b)}function P(a){var b=q(a,19),c=q(a,61);a=I(a,6);return new m(b.a^c.a^a.a,b.b^c.b^a.b)}function Q(a,b){var c,f,g;c=(a.b&65535)+(b.b&65535);f=(a.b>>>16)+(b.b>>>16)+(c>>>16);g=(f&65535)<<16|c&65535;c=(a.a&65535)+(b.a&65535)+(f>>>16);f=(a.a>>>16)+(b.a>>>16)+(c>>>16);return new m((f&65535)<<16|c&65535,g)}function R(a,b,c,f){var g,l,h;g=(a.b&65535)+(b.b&65535)+(c.b&65535)+(f.b&65535);l=(a.b>>>16)+(b.b>>>16)+(c.b>>>16)+(f.b>>>16)+(g>>>16);h=(l&65535)<<16|g&65535;g=(a.a&
65535)+(b.a&65535)+(c.a&65535)+(f.a&65535)+(l>>>16);l=(a.a>>>16)+(b.a>>>16)+(c.a>>>16)+(f.a>>>16)+(g>>>16);return new m((l&65535)<<16|g&65535,h)}function S(a,b,c,f,g){var l,h,s;l=(a.b&65535)+(b.b&65535)+(c.b&65535)+(f.b&65535)+(g.b&65535);h=(a.b>>>16)+(b.b>>>16)+(c.b>>>16)+(f.b>>>16)+(g.b>>>16)+(l>>>16);s=(h&65535)<<16|l&65535;l=(a.a&65535)+(b.a&65535)+(c.a&65535)+(f.a&65535)+(g.a&65535)+(h>>>16);h=(a.a>>>16)+(b.a>>>16)+(c.a>>>16)+(f.a>>>16)+(g.a>>>16)+(l>>>16);return new m((h&65535)<<16|l&65535,
s)}function u(a,b,c){var f,g,l,h,s,q,u,C,v,d,n,p,r,w,H,t,y,z,A,B,D,E,F,G,e,x=[],I,k=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,
2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];d=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];g=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];if("SHA-384"===c||"SHA-512"===c)n=80,f=(b+128>>>10<<
5)+31,w=32,H=2,e=m,t=Q,y=R,z=S,A=O,B=P,D=M,E=N,G=L,F=K,k=[new e(k[0],3609767458),new e(k[1],602891725),new e(k[2],3964484399),new e(k[3],2173295548),new e(k[4],4081628472),new e(k[5],3053834265),new e(k[6],2937671579),new e(k[7],3664609560),new e(k[8],2734883394),new e(k[9],1164996542),new e(k[10],1323610764),new e(k[11],3590304994),new e(k[12],4068182383),new e(k[13],991336113),new e(k[14],633803317),new e(k[15],3479774868),new e(k[16],2666613458),new e(k[17],944711139),new e(k[18],2341262773),new e(k[19],
2007800933),new e(k[20],1495990901),new e(k[21],1856431235),new e(k[22],3175218132),new e(k[23],2198950837),new e(k[24],3999719339),new e(k[25],766784016),new e(k[26],2566594879),new e(k[27],3203337956),new e(k[28],1034457026),new e(k[29],2466948901),new e(k[30],3758326383),new e(k[31],168717936),new e(k[32],1188179964),new e(k[33],1546045734),new e(k[34],1522805485),new e(k[35],2643833823),new e(k[36],2343527390),new e(k[37],1014477480),new e(k[38],1206759142),new e(k[39],344077627),new e(k[40],
1290863460),new e(k[41],3158454273),new e(k[42],3505952657),new e(k[43],106217008),new e(k[44],3606008344),new e(k[45],1432725776),new e(k[46],1467031594),new e(k[47],851169720),new e(k[48],3100823752),new e(k[49],1363258195),new e(k[50],3750685593),new e(k[51],3785050280),new e(k[52],3318307427),new e(k[53],3812723403),new e(k[54],2003034995),new e(k[55],3602036899),new e(k[56],1575990012),new e(k[57],1125592928),new e(k[58],2716904306),new e(k[59],442776044),new e(k[60],593698344),new e(k[61],3733110249),
new e(k[62],2999351573),new e(k[63],3815920427),new e(3391569614,3928383900),new e(3515267271,566280711),new e(3940187606,3454069534),new e(4118630271,4000239992),new e(116418474,1914138554),new e(174292421,2731055270),new e(289380356,3203993006),new e(460393269,320620315),new e(685471733,587496836),new e(852142971,1086792851),new e(1017036298,365543100),new e(1126000580,2618297676),new e(1288033470,3409855158),new e(1501505948,4234509866),new e(1607167915,987167468),new e(1816402316,1246189591)],
d="SHA-384"===c?[new e(3418070365,d[0]),new e(1654270250,d[1]),new e(2438529370,d[2]),new e(355462360,d[3]),new e(1731405415,d[4]),new e(41048885895,d[5]),new e(3675008525,d[6]),new e(1203062813,d[7])]:[new e(g[0],4089235720),new e(g[1],2227873595),new e(g[2],4271175723),new e(g[3],1595750129),new e(g[4],2917565137),new e(g[5],725511199),new e(g[6],4215389547),new e(g[7],327033209)];else throw"Unexpected error in SHA-2 implementation";for(;a.length<=f;)a.push(0);a[b>>>5]|=128<<24-b%32;a[f]=b;I=a.length;
for(p=0;p<I;p+=w){b=d[0];f=d[1];g=d[2];l=d[3];h=d[4];s=d[5];q=d[6];u=d[7];for(r=0;r<n;r+=1)16>r?(v=r*H+p,C=a.length<=v?0:a[v],v=a.length<=v+1?0:a[v+1],x[r]=new e(C,v)):x[r]=y(B(x[r-2]),x[r-7],A(x[r-15]),x[r-16]),C=z(u,E(h),F(h,s,q),k[r],x[r]),v=t(D(b),G(b,f,g)),u=q,q=s,s=h,h=t(l,C),l=g,g=f,f=b,b=t(C,v);d[0]=t(b,d[0]);d[1]=t(f,d[1]);d[2]=t(g,d[2]);d[3]=t(l,d[3]);d[4]=t(h,d[4]);d[5]=t(s,d[5]);d[6]=t(q,d[6]);d[7]=t(u,d[7])}if("SHA-384"===c)a=[d[0].a,d[0].b,d[1].a,d[1].b,d[2].a,d[2].b,d[3].a,d[3].b,d[4].a,
d[4].b,d[5].a,d[5].b];else if("SHA-512"===c)a=[d[0].a,d[0].b,d[1].a,d[1].b,d[2].a,d[2].b,d[3].a,d[3].b,d[4].a,d[4].b,d[5].a,d[5].b,d[6].a,d[6].b,d[7].a,d[7].b];else throw"Unexpected error in SHA-2 implementation";return a}"function"===typeof define&&define.amd?define(function(){return w}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=w:exports=w:J.jsSHA=w})(this);
;(function() {
  var include,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  include = function(factory) {
    var btoa, faye, jQuery, jsSHA, request;
    if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
      request = require("request");
      btoa = require("btoa");
      jsSHA = require("../lib/jsSHA/src/sha512");
      faye = require("faye");
      module.exports = factory(false, request, jsSHA, btoa, faye);
    } else {
      if ((typeof $ === "undefined" || $ === null) && (typeof jQuery === "undefined" || jQuery === null)) {
        throw "FirstRally api requires jQuery.";
        return;
      }
      jQuery = $ || jQuery;
      request = function(options, done) {
        var failure, success;
        if (done == null) {
          done = (function() {});
        }
        options.type = options.method;
        options.data = options.body;
        options.processData = false;
        success = function(data, textStatus, jqXHR) {
          return done(null, {
            statusCode: jqXHR.status
          }, jqXHR.responseText);
        };
        failure = function(jqXHR, textStatus, errorThrown) {
          return done(null, {
            statusCode: jqXHR.status
          }, jqXHR.responseText);
        };
        return jQuery.ajax(options).then(success, failure);
      };
      this.FirstRally = factory(true, request, jsSHA, btoa);
    }
  };

  include.call(this, function(inBrowser, request, jsSHA, btoa, Faye) {
    var Base, FirstRally;
    Base = (function() {
      function Base() {}

      Base.path_prefix = "";

      Base.config = {
        host: "bitcoinindex.es",
        scheme: "https",
        api_key: "",
        api_key_secret: "",
        version: "0.1"
      };

      Base.inBrowser = inBrowser;

      Base.set = function(options) {
        var key, results;
        results = [];
        for (key in options) {
          results.push(this.config[key] = options[key]);
        }
        return results;
      };

      Base.path = function(short_path) {
        return "/api/v" + this.config.version + this.path_prefix + short_path;
      };

      Base.url = function(short_path) {
        return this.config.scheme + "://" + this.config.host + (this.path(short_path));
      };

      Base.get = function(short_path, done) {
        return this.make_request(short_path, "GET", null, done);
      };

      Base.post = function(short_path, json, done) {
        return this.make_request(short_path, "POST", json, done);
      };

      Base["delete"] = function(short_path, done) {
        return this.make_request(short_path, "DELETE", null, done);
      };

      Base.make_request = function(short_path, method, body, done) {
        var b64string, options, path, response, shaObj, signature;
        if (done == null) {
          done = (function() {});
        }
        path = this.path(short_path);
        options = {
          url: this.url(short_path),
          headers: {},
          method: method
        };
        if (body != null) {
          options.body = JSON.stringify(body);
          options.headers["Content-Type"] = "application/json";
        }
        if (this.config.api_key !== "" && this.config.api_key_secret !== "") {
          shaObj = new jsSHA(path, "TEXT");
          signature = shaObj.getHMAC(this.config.api_key_secret, "TEXT", "SHA-512", "B64");
          b64string = btoa(this.config.api_key + ":" + signature);
          options.headers["Authorization"] = "Basic " + b64string;
        }
        if (done.length <= 1) {
          response = request(options);
          return done(response);
        } else {
          return request(options, function(error, response, body) {
            var errors;
            if (response.statusCode >= 400 && response.statusCode < 500) {
              if (error == null) {
                try {
                  errors = JSON.parse(body);
                } catch (_error) {
                  done(body, body);
                  return;
                }
                error = new FirstRally.Error(response.statusCode, errors);
              }
            } else {
              try {
                body = JSON.parse(body);
              } catch (_error) {

              }
            }
            return done(error, body);
          });
        }
      };

      return Base;

    })();
    FirstRally = (function(superClass) {
      extend(FirstRally, superClass);

      function FirstRally() {
        return FirstRally.__super__.constructor.apply(this, arguments);
      }

      FirstRally.Error = (function(superClass1) {
        extend(Error, superClass1);

        function Error(statusCode, original) {
          var error, i, len, message, ref;
          this.statusCode = statusCode;
          this.original = original;
          message = "";
          ref = this.original;
          for (i = 0, len = ref.length; i < len; i++) {
            error = ref[i];
            if (message.length !== 0) {
              message += " ";
            }
            message += error.message + ".";
          }
          this.message = message;
          this.name = "FirstRally.Error";
        }

        return Error;

      })(Error);

      FirstRally.User = (function(superClass1) {
        extend(User, superClass1);

        function User() {
          return User.__super__.constructor.apply(this, arguments);
        }

        User.path_prefix = "/user";

        User.update_profile = function(profile, done) {
          return this.post("/profile", profile, done);
        };

        User.change_password = function(new_password, current_password, done) {
          return this.post("/password", {
            new_password: new_password,
            current_password: current_password
          }, done);
        };

        User.login = function(email, password, done) {
          return this.post(login, {
            email: email,
            password: password
          }, done);
        };

        return User;

      })(Base);

      FirstRally.Notification = (function(superClass1) {
        extend(Notification, superClass1);

        function Notification() {
          return Notification.__super__.constructor.apply(this, arguments);
        }

        Notification.path_prefix = "/notification";

        Notification.create = function(stream_id, price, direction, done) {
          return this.post("/new", {
            stream_id: stream_id,
            price: price,
            direction: direction
          }, done);
        };

        Notification["delete"] = function(notification_id) {
          return this["delete"]("/" + notification_id, done);
        };

        return Notification;

      })(Base);

      FirstRally.DataBatch = (function(superClass1) {
        extend(DataBatch, superClass1);

        function DataBatch() {
          return DataBatch.__super__.constructor.apply(this, arguments);
        }

        DataBatch.path_prefix = "/data_batch";

        DataBatch.create = function(stream_id, start_date, end_date, done) {
          return this.post("/new", {
            exchange_identifier: stream_id,
            start_date: start_date.getTime(),
            end_date: end_date.getTime()
          }, done);
        };

        DataBatch.status = function(data_batch_id, done) {
          return this.get("/" + data_batch_id, done);
        };

        return DataBatch;

      })(Base);

      FirstRally.BatchFile = (function(superClass1) {
        extend(BatchFile, superClass1);

        function BatchFile() {
          return BatchFile.__super__.constructor.apply(this, arguments);
        }

        BatchFile.path_prefix = "/batch_file";

        BatchFile.download = function(batch_file_id, done) {
          var path;
          path = "/" + batch_file_id + "/download";
          if (inBrowser) {
            return window.open(this.url(path));
          } else {
            return this.get(path, done);
          }
        };

        return BatchFile;

      })(Base);

      FirstRally.DataStream = (function(superClass1) {
        extend(DataStream, superClass1);

        function DataStream() {
          return DataStream.__super__.constructor.apply(this, arguments);
        }

        DataStream.path_prefix = "/data_stream";

        DataStream.rtc_url = "https://rtc.bitcoinindex.es/connect";

        DataStream.list = function(done) {
          return this.get("/list", done);
        };

        DataStream.subscribe = function(stream_id, callbacks) {
          var clientAuth;
          if (callbacks == null) {
            callbacks = {};
          }
          if (Faye == null) {
            throw new Error("DataStreams::subscribe() should only be used within a server environment!");
          }
          if (this.client == null) {
            this.subscriptions = {};
            this.client = new Faye.Client(this.rtc_url);
            clientAuth = {
              outgoing: (function(_this) {
                return function(message, callback) {
                  if (message.ext == null) {
                    message.ext = {};
                  }
                  message.ext.api_key = _this.config.api_key;
                  message.ext.api_key_secret = _this.config.api_key_secret;
                  return callback(message);
                };
              })(this)
            };
            this.client.addExtension(clientAuth);
          }
          this.subscriptions[stream_id] = this.client.subscribe("/" + stream_id, (function(_this) {
            return function(message) {
              if (callbacks.message != null) {
                return callbacks.message(message);
              }
            };
          })(this));
          return this.subscriptions[stream_id].then((function(_this) {
            return function() {
              if (callbacks.subscribe != null) {
                return callbacks.subscribe();
              }
            };
          })(this));
        };

        DataStream.unsubscribe = function(stream_id) {
          if (this.client == null) {
            return;
          }
          if ((this.subscriptions == null) || (this.subscriptions[stream_id] == null)) {
            return;
          }
          this.subscriptions[stream_id].cancel();
          return delete this.subscriptions[stream_id];
        };

        return DataStream;

      })(Base);

      return FirstRally;

    })(Base);
    return FirstRally;
  });

}).call(this);
