
$(function() {
$('li#price-report55').jsonpricereport({
        commodity: '55'
    })
$('li#price-report50').jsonpricereport({
        commodity: '50'
    })
});

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
            commodity: null
        },options || {});

        if( !args.commodity ) {
            return false; // 引数不足
        }

        $(this).each(function(){
            var self = $(this);
            var jsonfile = './price_' + args.commodity + '.json';

            var timestamp = '?timestamp='+(new Date()).getTime(); // IEのajaxリクエストのキャッシュを防ぐ対策
            $.getJSON( jsonfile + timestamp, function(json) {
                var items = [];
                var prices = new Array(json.colsize);
                $.each(json.prices, function(i, sessions) {
                    $.each(sessions.values, function(j, value) {
                        if(value=="") return;
                        prices[j] = value;
                    });
                });
                $('#timestamp').append(args.commodity == '55' ? json.timestamp : '');
                for (var i=0; i < json.colsize; i++) {
                    // 限月一覧 (限月、約定値段(前日比)、出来高)
                    var durations = json.durations[i] == '' ? '新甫' : json.durations[i]
                    items.push('<li class="list-group-item">');
                    items.push('<a data-toggle="collapse" href="#collapse' + args.commodity + i + '" aria-controls="collapse' + i + '">');
                    items.push('<div class="row">');
                    items.push('<div class="col-xs-3 col-sm-2 col-md-2">' + json.months[i] + '</div>');
                    items.push('<div class="col-xs-4 col-sm-3 col-md-3">' + prices[i] + ' (' + durations + ')</div>');
                    items.push('<div class="col-xs-4 col-sm-3 col-md-3">' + json.volumes[i] + '</div>');
                    items.push('</div>')
                    items.push('</a>')

                    // 詳細テーブル
                    items.push('<div id="collapse' + args.commodity + i + '" class="collapse panel-body">');
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
                    $.each(json.prices, function(j, sessions) {
                        items.push('<tr>');
                        if( json.amsize >= 0 ){
                            if( 0 == j ){
                                items.push('<th rowspan=' + json.amsize + '>前場</th>');
                            }
                        }
                        if( json.pmsize >= 0 ){
                            if( json.amsize == j ){
                                items.push('<th rowspan=' + json.pmsize + '>後場</th>');
                            }
                        }
                        items.push('<th>' + sessionName(sessions.sid) + '</th>');
                        items.push('<td >'+ sessions.values[i] +'</td>');
                        items.push('</tr>');
                    });
                    items.push('</tbody>');
                    items.push('</table>');
                    items.push('</div>');
                    items.push('</div>');
                }

                    // 内容の入れ替え.
//                    self.contents().remove();

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
