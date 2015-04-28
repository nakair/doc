// ----------------------------------------
// 相場表テーブル json読み込み プラグイン
// ----------------------------------------
// usage: 
// $('#price-report').jsonpricereport({
//   jsonfile: './price_rice.json'
// });
// ----------------------------------------

(function($){
    // 最新
    $.fn.jsonpricereport = function(options){

        var args = $.extend({
            jsonfile: null
        },options || {});

        if( !args.jsonfile ) {
            return false; // 引数不足
        }

        // 同期通信(JSON取得を待ち合わせる)
        $.ajaxSetup({async: false});
        $.ajaxSetup({scriptCharset: "utf-8" , contentType: "application/json; charset=utf-8"});

        $(this).each(function(){
            var self = $(this);
            var a = args.jsonfile;
            var commodity = a.substr(a.indexOf("_") + 1, 2);

            var timestamp = '?timestamp='+(new Date()).getTime(); // IEのajaxリクエストのキャッシュを防ぐ対策
            $.getJSON( args.jsonfile + timestamp, function(json) {
                var items = [];
                var prices = new Array(json.colsize);
                $.each(json.prices, function(i, sessions) {
                    $.each(sessions.values, function(i, value) {
                        if(value=="") return;
                        prices[i] = value;
                    });
                });
                $('#timestamp').append(commodity == '55' ? json.timestamp : '');
                for (var i=0; i < json.colsize; i++) {
                    // 限月一覧 (限月、約定値段(前日比)、出来高)
                    var durations = json.durations[i] == '' ? '新甫' : json.durations[i]
                    items.push('<li class="list-group-item" data-toggle="collapse" href="#collapse' + commodity + i + '" aria-controls="collapse' + i + '">');
                    items.push(json.months[i] + '&nbsp');
                    items.push('<small>' + prices[i] + ' (' + durations + ')' + '&nbsp');
                    items.push(json.volumes[i] + '</small>');

                    // 詳細テーブル
                    items.push('<div id="collapse' + commodity + i + '" class="panel-collapse collapse panel-body">');
                    items.push('<table class="table">');
                    items.push('<tbody>');

//                    // 1. 限月
//                    items.push('<tr>');
//                    items.push('<th colspan=2 class="rowname">限月</th>');
//                    items.push('<td class="month">'+ esc(json.months[i]) +'</td>');
//                    items.push('</tr>');
//
//                    // 2. 前日終値
//                    items.push('<tr>');
//                    items.push('<th colspan=2 class="rowname">前日終値</th>');
//                    items.push('<td>'+ esc(json.prevprices[i]) +'</td>');
//                    items.push('</tr>');

                    // 3. 約定値段
                    $.each(json.prices, function(i, sessions) {
                        items.push('<tr>');
                        if( json.amsize >= 0 ){
                            if( 0 == i ){
                                items.push('<th rowspan=' + json.amsize + ' class="rowname">前場</th>');
                            }
                        }
                        if( json.pmsize >= 0 ){
                            if( json.amsize == i ){
                                items.push('<th rowspan=' + json.pmsize + ' class="rowname">後場</th>');
                            }
                        }
                        items.push('<th class="rowname">'+sessionName(sessions.sid)+'</th>');
                        items.push('<td >'+ sessions.values[i] +'</td>');
                        items.push('</tr>');
                    });
                    items.push('</tbody>');
                    items.push('</table>');
                    items.push('</div>');
                    items.push('</div>');
                }

                    // 内容の入れ替え.
                    self.contents().remove();

                    $('<ul/>', {
                        'class': 'list-group',
                        html: items.join('')
                    }).appendTo( self );

                })
                .error(function() {
                    self.contents().remove();
                    self.append( '<div style="color:red; border: 1px solid red;">[error] データ読込みに失敗しました</div>');
                });
            });

        // 一応の後始末(元に戻す).
       $.ajaxSetup({async: true});
    }

})(jQuery);

function sessionName( sessionid ){
	if( sessionid == "11" ){ return "第１節"; }
	if( sessionid == "12" ){ return "第２節"; }
	if( sessionid == "13" ){ return "第３節"; }
	if( sessionid == "21" ){ return "第１節"; }
	if( sessionid == "22" ){ return "第２節"; }
	if( sessionid == "23" ){ return "第３節"; }
	return sessionid;
}
function esc( val ){
	if( val == null ){ return "&nbsp;" }
	if( val == undefined ){ return "&nbsp;" }
	if( val == "" ){ return "&nbsp;" } // FIXME trim未実装
	return val;
}
