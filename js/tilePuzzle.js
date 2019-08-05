(function($) {
    var mainFunction = function(options) {
        var vars = {
                imageUrl: "https://images.unsplash.com/photo-1445820133247-bfef6cc162a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80",
                level: 4, //Grid must be less than 6 and greater than 2
                bsPosition: 'random', //Blank Block
                maxWidth: '', //Container Size
                speed: 2, //Initial Animation Speed, 0 tends to slow
                animation: '', //Animation Class 
                /*  bounce | flash | pulse | rubberBand | shake
                    swing | tada | wobble | jello | bounceIn
                    bounceInDown | bounceInLeft | bounceInRight
                    bounceInUp | fadeIn | fadeInDown | fadeInDownBig
                    fadeInLeft | fadeInLeftBig | fadeInRight
                    fadeInRightBig | fadeInUp | fadeInUpBig | flip
                    flipInX | flipInY | lightSpeedIn | rotateIn
                    rotateInDownLeft | rotateInDownRight
                    rotateInUpLeft | rotateInUpRight | rollIn
                    zoomIn | zoomInDown | zoomInLeft | zoomInRight
                    zoomInUp | slideInDown | slideInLeft
                    slideInRight | slideInUp*/
                gameLevel: 'easy', // Game Lavel 'hard' or 'easy'
                animationSet: ["bounce", "flash", "pulse", "rubberBand", "shake", "swing", "tada", "wobble", "jello", "bounceIn", "bounceInDown", "bounceInLeft", "bounceInRight", "bounceInUp", "fadeIn", "fadeInDown", "fadeInDownBig", "fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig", "fadeInUp", "fadeInUpBig", "flip", "flipInX", "flipInY", "lightSpeedIn", "rotateIn", "rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft", "rotateInUpRight", "rollIn", "zoomIn", "zoomInDown", "zoomInLeft", "zoomInRight", "zoomInUp", "slideInDown", "slideInLeft", "slideInRight", "slideInUp"]
            },
            root = this,
            boxProperty = {}
        const eventList = [];
        root.callEventsAfterLoad = function() {
                eventList.forEach(function(o) {
                    if (typeof o.callBack === "function") {
                        o.callBack.apply(null, o.arguments);
                    }
                })
            },
            //Construct
            construct = function(v, options) {
                $.extend(v, options);
            },
            checkLevel = function(l) {
                if (l < 3) {
                    l = 3
                } else if (l > 5) {
                    l = 5
                }
                construct(vars, { level: l });
            },
            imgSize = function(i,p) {
                $(i).append('<img/>');
                var img = $(i).find('img');
                img.attr('src',vars.imageUrl);
                img.on('load',function(){
                        width=img[0].naturalWidth,
                        height=img[0].naturalHeight
                    var min = Math.min.apply(Math, [width, height]);
                    // var r = p.width/min;
                    switch(min){
                        case(width):
                            s={
                                backgroundSize: p.width+"px auto"
                            }
                        break;
                        case(height):

                            s={
                                backgroundSize: "auto "+p.height+"px"
                            }
                        break;
                        default:
                    }
                    $(i).css(s);
                    $('.block-pie',i).css(s);
                    $(this).remove();
                });
            },
            //Returns animation class
            randomAnimation = function(a) {
                var v = Math.floor(Math.random() * vars.animationSet.length);
                return (jQuery.inArray(a, vars.animationSet) != -1) ? a : vars.animationSet[v];
            },
            //Window Height
            gWH = function() {
                return $(window).height()
            },
            //Window Width
            gWW = function() {
                return $(window).width()
            },
            //Creat block's container
            createBox = function(e) {
                if (vars.maxWidth == '' || vars.maxWidth === undefined) {
                    vars.maxWidth = $(e).parents().width();
                }
                var w = vars.maxWidth;
                var h = gWH();
                var mLR = 10; //Container left-right margin
                var mTB = 10; //Container top-bottom margin
                var min = Math.min.apply(Math, [w, h]);
                aW = min - mLR * 2;
                aH = min - mTB * 2;
                mLR = ((w - aW)) / 2;
                mTB = ((h - aH)) / 2;
                return {
                    width: aW,
                    height: aH,
                    LR: mLR,
                    TB: mTB
                };
            },
            //Total numbers of block array start from 0
            tB = function(n) {
                var a = [];
                for (i = 0; i < n; i++) {
                    a.push(i)
                }
                return a;
            },
            //Range Function
            inRange = function(n, nStart, nEnd) {
                if (n > nStart && n < nEnd) {
                    return false;
                } else {
                    return n
                };
            },
            //Block position initial load [Position will set outside the box, it is for random animation option]
            randomOutRange = function(min, max, range) {
                var v = Math.floor(Math.random() * (+max - +min)) + +min;
                if (inRange(v, range[0], range[1]) !== false) {
                    return v;
                } else {
                    return randomOutRange(min, max, range);
                }
            },
            //Check the result
            result = function(e, m) {
                var ratio = vars.maxWidth / 1000;
                var result = true;
                e.find('.block-pie').each(function() {
                    var a = $(this).attr('actual-position');
                    var r = $(this).attr('random-position');
                    if (a !== r) {
                        result = false;
                    }
                });
                if (result) {
                    greatMove = (vars.level * vars.level) * 4;
                    goodMove = (vars.level * vars.level) * 5;
                    switch (true) {
                        case (m <= greatMove):
                            rStatus = "Great";
                            rClass = "great";
                            break;
                        case (m <= goodMove):
                            rStatus = "Good"
                            rClass = "good"
                            break;
                        default:
                            rStatus = "Average"
                            rClass = "average"

                    }
                    e.addClass("success");
                    e.html(`<div class="result">
                        <div class="table-col">
                            <div class="table-col-cell">
                                <h2 style="font-size:` + ratio * 5 + `rem">Success</h2>
                                <h5 style="font-size:` + ratio * 3 + `rem;line-height:` + ratio * 4 + `rem;">You are <span class="` + rClass + `">` + rStatus + `!<span></h5>
                                <div class="moves" style="margin:` + ratio * 4 + `px 0;">
                                    <p>Total Move<span style="font-size:` + ratio * 4 + `rem;">` + m + `</span></p>
                                </div>
                                <a href="#" class="replay" style="font-size:` + ratio * 2 + `rem;"><i class="fa fa-play-circle"></i> Play Again</a>
                            </div>
                        </div>
                    </div>`)
                    //Restart Game
                    e.find('.replay').on('click', function() {
                        e.removeClass('success')
                        e.html('');
                        e.tilePuzzle(vars);
                    })
                }
            },
            //Blank block position
            bsPosition = function(b) {
                var tB = vars.level * vars.level;
                if (b == 'random' || jQuery.type(b) !== "number") {
                    return Math.floor(Math.random() * tB);
                }
                switch (true) {
                    case (b >= tB):
                        return b - 1;
                        break;
                    case (b <= 1):
                        return 0;
                        break;
                    default:
                        return b - 1;
                }
            },
            //Set Container
            root.setBox = function(e) {
                var box = $(e),
                    l = vars.level,
                    p = createBox(e),
                    b = vars.level * vars.level,
                    aP = tB(b),
                    rP = [],
                    pSet = [],
                    blockspotPosition = bsPosition(vars.bsPosition),
                    move = 0;
                var len = aP;
                //Main box
                box.width(p.width);
                box.height(p.height);
                box.css({
                    marginTop: p.TB,
                    marginBottom: p.TB,
                    marginLeft: p.LR,
                    marginRight: p.LR,
                    background: 'url(' + vars.imageUrl + ')',
                    backgroundRepeat: "no-repeat",
                    //backgroundSize: p.width + "px " + p.height + "px",
                });
                //Suffle Boxes
                y = -1;
                x = 0;
                for (i = 0; i < b; i++) {
                    y = (i % l == 0) ? y + 1 : y;
                    x = (i % l == 0) ? 0 : x + 1;
                    //Set animation
                    animation = randomAnimation(vars.animation);
                    //Actual Position Set Array
                    pSet.push({ x: x * p.width / l, y: y * p.height / l })
                    //Last block
                    var bSpot = (i == blockspotPosition) ? " block-spot" : "";
                    var block = $('<div>').addClass('block-pie' + bSpot + ' animated ' + animation).css({
                        position: "absolute",
                        width: p.width / l,
                        height: p.width / l,
                        background: 'url(' + vars.imageUrl + ')',
                        backgroundRepeat: "no-repeat",
                        //backgroundSize: p.width + "px " + p.height + "px",
                        backgroundPosition: -(x * p.width / l) + "px " + -(y * p.height / l) + "px"
                    }).appendTo(box).append('<a href="#"></a>');
                    //Random Position
                    var randBlock = Math.floor(Math.random() * len.length);
                    var temp = len[randBlock];
                    rP.push(temp);
                    len = $.grep(len, function(value) {
                        return value != temp;
                    });
                    block.attr({ 'random-position': temp, 'actual-position': i });
                }
                imgSize(box,p);
                var ad = vars.speed / b;
                box.find('.block-pie').each(function(i, e) {
                    var _block = $(this);
                    //Set Random 
                    var max = p.width * 2;
                    var min = -p.width;
                    var xP = randomOutRange(min, max, [-(p.width / l), p.width]);
                    var yP = randomOutRange(min, max, [-(p.height / l), p.height]);
                    _block.css({
                        left: xP,
                        top: yP,
                        '-moz-animation-delay': ad * (i + 1) + 2.5 + 's',
                        '-ms-animation-delay': ad * (i + 1) + 2.5 + 's',
                        '-webkit-animation-delay': ad * (i + 1) + 2.5 + 's',
                        'animation-delay': ad * (i + 1) + 2.5 + 's'
                    });

                    eventList.push({
                        callBack: function() {
                            _block.animate({
                                left: pSet[rP[i]].x,
                                top: pSet[rP[i]].y
                            }, 1600);
                            _block.on('click', function(e) {
                                var r = parseInt(_block.attr('random-position'));
                                var a = parseInt(box.find('[actual-position="' + blockspotPosition + '"]').attr('random-position'));
                                var ra = '';
                                var mCk = false;
                                switch (true) {
                                    case (r - l == a):
                                        ra = 'rubberBand';
                                        mCk = true;
                                        break;
                                    case (r + l == a):
                                        ra = 'rubberBand';
                                        mCk = true;
                                        break;
                                    case (r - 1 == a && a % l !== l - 1):
                                        ra = 'fadeIn';
                                        mCk = true;
                                        break;
                                    case (r + 1 == a && a % l !== 0):
                                        ra = 'fadeIn';
                                        mCk = true;
                                        break;
                                    default:
                                        mCk = false;
                                }
                                if (mCk) {
                                    _block.removeClass(vars.animationSet);
                                    _block.attr('random-position', a);
                                    box.find('[actual-position="' + blockspotPosition + '"]').attr('random-position', r);
                                    box.find('[actual-position="' + blockspotPosition + '"]').css({ top: pSet[r].y, left: pSet[r].x });
                                    _block.css({
                                        '-moz-animation-delay': 0.25 + 's',
                                        '-ms-animation-delay': 0.25 + 's',
                                        '-webkit-animation-delay': 0.25 + 's',
                                        'animation-delay': 0.25 + 's'
                                    });
                                    move++;
                                    if (vars.gameLevel == 'hard') {
                                        _block.css({ top: pSet[a].y, left: pSet[a].x });
                                        // _block.addClass(randomAnimation());
                                        _block.addClass(ra);
                                    } else {
                                        _block.animate({ top: pSet[a].y, left: pSet[a].x }, "fast");
                                    }
                                    result(box, move);
                                }
                                e.preventDefault();
                            });
                        },
                        arguments: []
                    })

                });
                setTimeout(function() {
                    root.callEventsAfterLoad();
                }, 1500);
            },
            construct(vars, options);
        checkLevel(vars.level)
    }
    $.fn.tilePuzzle = function(option) {
        return this.each(function() {
            var _root = this;
            var main = new mainFunction(option);
            main.setBox(_root);
        })
    };
}(jQuery));
