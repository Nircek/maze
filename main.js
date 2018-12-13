"use strict";
var canvas, ctx;
var WIDTH, HEIGHT;
var cb;
var body;
var W, H, map;
var keylog = false;


class Map {
    constructor(W, H) {
        this.ds = {x:W, y:H, a:H*W};   //ds is DimensionS
        this.m = [];
        this.buf = '';
        this.minDist = this.dist({x:0,y:0},this.ds)/2;
        for(let i=0; i<this.ds.x; ++i){
            this.m = this.m.concat([[]]);
            for(let j=0; j<this.ds.y; ++j)
                this.m[i]  = this.m[i].concat(true);
        }
    }

    get(p) {
        if(p.x<this.ds.x&&p.x>=0&&p.y<this.ds.y&&p.y>=0)
            return this.m[p.x][p.y];
        else return true;
    }
    
    set(p, z) {
        if(p.x<this.ds.x&&p.x>=0&&p.y<this.ds.y&&p.y>=0&&
           this.m[p.x][p.y]!=z)
            this.m[p.x][p.y] = z;
        else return false;
        return true;
    }

    randp() {
        var x = Math.floor(Math.random()*this.ds.a);
        var y = Math.floor(x/this.ds.x);
        x %= this.ds.x;
        return {x:x, y:y};
    }

    gen() {
        this.pl = this.randp();
        this.lpl = this.pl;
        this.set(this.pl, false);
        let iters = 0;
        let jters = 0;
        while(iters<this.ds.a*3) {
            ++iters;
            ++jters;
            let p = this.randp();
            let n = 0;
            let ni = 0;
            let d = {};
            for(d.x=-1; d.x<=1; ++d.x) {
                for(d.y=-1; d.y<=1; ++d.y) {
                    if(d.x==0&&d.y==0)
                        continue;
                    if(!this.get(this.add(p, d))) {
                        n += 1;
                        if(d.x==0||d.y==0)
                          ni += 1;
                    }
                }
            }
            if(ni==1&&n<3)
                if(this.set(p, false))
                    iters = 0;
            
        }
        console.log(jters);
    }
    
    add(a, b) {
        return {x:a.x+b.x, y:a.y+b.y};
    }
    
    isSame(a, b) {
        return a.x==b.x&&a.y==b.y;
    }
    
    dist(a, b) {
        return Math.sqrt( Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2) );
    }
    
    genEnd() {
        let p = {x:-1, y:-1}
        while(this.get(p)||this.dist(p, this.pl)<this.minDist)
            // while endPoint is wall or if is too near to player (diagonal of map/2 is too near)
            p = this.randp()
        this.e = p;
    }
    
    render(o) {
        if(!o)o={}
        if(!o.hasOwnProperty('n'))o.n = 0;
        if(!o.hasOwnProperty('m'))o.m = 10;   // margin
        if(!o.hasOwnProperty('m'))o.c = 'black';
        ctx.fillStyle = o.c;
        if(!(o.hasOwnProperty('s')&&o.hasOwnProperty('x')&&o.hasOwnProperty('x'))) {
            o.x = WIDTH - 2*o.m;
            o.y = HEIGHT - 2*o.m;
            o.s = Math.min(o.x/(this.ds.x+2), o.y/(this.ds.y+2));
            o.x = (WIDTH - o.s*(this.ds.x+2))/2;
            o.y = (HEIGHT - o.s*(this.ds.y+2))/2;
        } else {
            o.x += o.m;
            o.y += o.m;
        }
        ctx.clearRect(o.x, o.y, o.s*(this.ds.x+2), o.s*(this.ds.y+2));
        for(let i=0; i<this.ds.x+2; ++i)
            for(let j=0; j<this.ds.y+2; ++j)
                if(map.get({x:i-1, y:j-1}))
                    ctx.fillRect(o.x+o.s*i, o.y+o.s*j, o.s-o.n, o.s-o.n);
        this.o = o;
        this.updatePos();
        ctx.fillStyle = 'green';
        ctx.fillRect(o.x+o.s*(this.e.x+1)+o.s*0.25, o.y+o.s*(this.e.y+1)+o.s*0.25, o.s*0.5, o.s*0.5);
    }
    
    updatePos(){
        let o = this.o;
        ctx.fillStyle = 'black';
        ctx.clearRect(o.x+o.s*(this.lpl.x+1), o.y+o.s*(this.lpl.y+1), o.s, o.s);
        ctx.fillRect(o.x+o.s*(this.pl.x+1)+o.s*0.25, o.y+o.s*(this.pl.y+1)+o.s*0.25, o.s*0.5, o.s*0.5);
        this.lpl = this.pl;
        
    }
}

class CanvasButtons {
    constructor(canvas) {
        this.arr = [];
        this.ctx = canvas.getContext('2d');
        this.lx = -1;
        this.ly = -1;
        canvas.cbs = this;
        canvas.onclick = function(event) {
            // https://stackoverflow.com/a/5932203
            var totalOffsetX = 0;
            var totalOffsetY = 0;
            var canvasX = 0;
            var canvasY = 0;
            var currentElement = this;
            do{
                totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
                totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
            }
            while(currentElement = currentElement.offsetParent);
            var cX = event.pageX - totalOffsetX;
            var cY = event.pageY - totalOffsetY;
            this.cbs.lx = cX;
            this.cbs.ly = cY;
            
            for(let i = 0; i<this.cbs.arr.length; ++i)  // for each button in arr
                if(this.cbs.arr[i].x<=cX&&this.cbs.arr[i].cx>=cX&&
                   this.cbs.arr[i].y<=cY&&this.cbs.arr[i].cy>=cY)   // check is there was a click on this button
                    this.cbs.arr[i].f(cX-this.cbs.arr[i].x, cY-this.cbs.arr[i].y);  // if so, call function assigned to this button
        }
    }
    add(p, t, o={}, f=null){
        if(!o.hasOwnProperty('h'))o.h=30;   // height
        if(!o.hasOwnProperty('m'))o.m=5;    // margin
        if(!o.hasOwnProperty('c'))o.c='black';  // color
        if(!o.hasOwnProperty('c'))o.b=true; // border
        // fill with default values
        this.ctx.font = o.h+'px fantasy';
        this.ctx.strokeStyle = o.c;
        var w = this.ctx.measureText(t).width;
        if(o.b)
            this.ctx.strokeRect(p.x-w/2-o.m, p.y-o.h/2-o.m, w+o.m*2, o.h+o.m*2);
        this.ctx.strokeText(t, p.x-w/2, p.y+o.h/4);
        if(f!=null){
            var n = {x:p.x-w/2-o.m, y:p.y-o.h/2-o.m, w:w+o.m*2, h:o.h+o.m*2, f:f};
            n.cx = n.x+n.w;
            n.cy = n.y+n.h;
            n.arr = this.arr;
            n.ctx = this.ctx;
            this.arr.push(n);
        }
    }
}

function init() {
    body = document.getElementById('body');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    WIDTH = document.body.scrollWidth;
    HEIGHT = Math.floor(window.innerHeight-Math.PI);
    W = Math.floor(WIDTH / 12);
    H = Math.floor(HEIGHT / 12);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.strokeStyle = '#ff1aff';
    for(let i=3; i<5; ++i)
        ctx.strokeRect(i,i,WIDTH-2*i,HEIGHT-2*i);
    cb = new CanvasButtons(canvas);
    
    cb.add({x:WIDTH/2,y:HEIGHT/2},'Start new game', {b:false}, function(a, b){
        this.arr.splice(this.arr.indexOf(this),1);
        this.ctx.clearRect(this.x,this.y,this.W,this.H);
        map = new Map(W, H);
        map.gen();
        map.genEnd();
        map.render({c:'olive'});
        body.onkeypress = function(e){
            if(keylog)console.log(e);
            var d = {x:0, y:0};
            switch(e.key){
                case 'ArrowUp':   case 'W':case 'w': d.y = -1; break;
                case 'ArrowDown': case 'S':case 's': d.y = +1; break;
                case 'ArrowLeft': case 'A':case 'a': d.x = -1; break;
                case 'ArrowRight':case 'D':case 'd': d.x = +1; break;
                default: d = -1; break;
            }
            if(d!=-1){
                let n = map.add(map.pl, d);
                if(!map.get(n)) {
                    map.pl = n
                    if(map.isSame(map.pl, map.e)) {
                        map = new Map(W, H);
                        map.gen();
                        map.genEnd();
                        map.render({c:'olive'});
                    }
                }
                map.updatePos();
            }
        }
    });
}
