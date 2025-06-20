'use strict';

const { get } = require("http");

var unitTesting=false;
var curlevel=0;
var curlevelTarget=null;
var hasUsedCheckpoint=false;
var levelEditorOpened=false;
var muted=0;
var runrulesonlevelstart_phase=false;
var ignoreNotJustPressedAction=true;

function doSetupTitleScreenLevelContinue(){
    try {
        if (storage_has(document.URL)) {
            if (storage_has(document.URL+'_checkpoint')){
                var backupStr = storage_get(document.URL+'_checkpoint');
                curlevelTarget = JSON.parse(backupStr);
                
                var arr = [];
                for(var p in Object.keys(curlevelTarget.dat)) {
                    arr[p] = curlevelTarget.dat[p];
                }
                curlevelTarget.dat = new Int32Array(arr);

            }
            curlevel = storage_get(document.URL); 
        }
    } catch(ex) {
    }
}

doSetupTitleScreenLevelContinue();


var verbose_logging=false;
var throttle_movement=false;
var cache_console_messages=false;
var quittingTitleScreen=false;
var quittingMessageScreen=false;
var deltatime=17;
var timer=0;
var repeatinterval=150;
var autotick=0;
var autotickinterval=0;
var winning=false;
var againing=false;
var againinterval=150;
var norepeat_action=false;
var oldflickscreendat=[];//used for buffering old flickscreen/scrollscreen positions, in case player vanishes
var keybuffer = [];

var restarting=false;

var messageselected=false;

var textImages={};
var initLevel = {
    width: 5,
    height: 5,
    layerCount: 2,
    dat: [
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2,
    3, 2, 1, 3, 2, 1, 3, 2, 1, 3,
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2
    ],
    movementMask:[
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2,
    3, 2, 1, 3, 2, 1, 3, 2, 1, 3,
    1, 3, 3, 1, 1, 2, 2, 3, 3, 1,
    2, 1, 2, 2, 3, 3, 1, 1, 2, 2
    ],
    rigidGroupIndexMask:[],//[indexgroupNumber, masked by layer arrays]
    rigidMovementAppliedMask:[],//[indexgroupNumber, masked by layer arrays]
    bannedGroup:[],
    colCellContents:[],
    rowCellContents:[],
    colCellContents_Movements:[],
    rowCellContents_Movements:[],
};

var level = initLevel;


var colorPalettes = {
	mastersystem : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#555555",
	darkgrey		: "#555500",
	lightgrey		: "#AAAAAA",
	gray			: "#555555",
	darkgray		: "#555500",
	lightgray		: "#AAAAAA",
	red				: "#FF0000",
	darkred			: "#AA0000",
	lightred		: "#FF5555",
	brown			: "#AA5500",
	darkbrown		: "#550000",
	lightbrown		: "#FFAA00",
	orange			: "#FF5500",
	yellow 			: "#FFFF55",
	green			: "#55AA00",
	darkgreen		: "#005500",
	lightgreen		: "#AAFF00",
	blue			: "#5555AA",
	lightblue		: "#AAFFFF",
	darkblue		: "#000055",
	purple			: "#550055",
	pink			: "#FFAAFF"
	},

	gameboycolour : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#7F7F7C",
	darkgrey		: "#3E3E44",
	lightgrey		: "#BAA7A7",
	gray			: "#7F7F7C",
	darkgray		: "#3E3E44",
	lightgray		: "#BAA7A7",
	red				: "#A7120C",
	darkred			: "#880606",
	lightred		: "#BA381F",
	brown			: "#57381F",
	darkbrown		: "#3E2519",
	lightbrown		: "#8E634B",
	orange			: "#BA4B32",
	yellow 			: "#C0BA6F",
	green			: "#517525",
	darkgreen		: "#385D12",
	lightgreen		: "#6F8E44",
	blue			: "#5D6FA7",
	lightblue		: "#8EA7A7",
	darkblue		: "#4B575D",
	purple			: "#3E3E44",
	pink			: "#BA381F"
	},

	amiga : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#BBBBBB",
	darkgrey		: "#333333",
	lightgrey		: "#FFEEDD",
	gray			: "#BBBBBB",
	darkgray		: "#333333",
	lightgray		: "#FFEEDD",
	red				: "#DD1111",
	darkred			: "#990000",
	lightred		: "#FF4422",
	brown			: "#663311",
	darkbrown		: "#331100",
	lightbrown		: "#AA6644",
	orange			: "#FF6644",
	yellow 			: "#FFDD66",
	green			: "#448811",
	darkgreen		: "#335500",
	lightgreen		: "#88BB77",
	blue			: "#8899DD",
	lightblue		: "#BBDDEE",
	darkblue		: "#666688",
	purple			: "#665555",
	pink			: "#997788"
	},

	arnecolors : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#9d9d9d",
	darkgrey		: "#697175",
	lightgrey		: "#cccccc",
	gray			: "#9d9d9d",
	darkgray		: "#697175",
	lightgray		: "#cccccc",
	red				: "#be2633",
	darkred			: "#732930",
	lightred		: "#e06f8b",
	brown			: "#a46422",
	darkbrown		: "#493c2b",
	lightbrown		: "#eeb62f",
	orange			: "#eb8931",
	yellow 			: "#f7e26b",
	green			: "#44891a",
	darkgreen		: "#2f484e",
	lightgreen		: "#a3ce27",
	blue			: "#1d57f7",
	lightblue		: "#B2DCEF",
	darkblue		: "#1B2632",
	purple			: "#342a97",
	pink			: "#de65e2"
	},
	famicom : {
	black   		: "#000000",
	white			: "#ffffff",
	grey			: "#7c7c7c",
	darkgrey		: "#080808",
	lightgrey		: "#bcbcbc",
	gray			: "#7c7c7c",
	darkgray		: "#080808",
	lightgray		: "#bcbcbc",
	red				: "#f83800",
	darkred			: "#881400",
	lightred		: "#f87858",
	brown			: "#AC7C00",
	darkbrown		: "#503000",
	lightbrown		: "#FCE0A8",
	orange			: "#FCA044",
	yellow 			: "#F8B800",
	green			: "#00B800",
	darkgreen		: "#005800",
	lightgreen		: "#B8F8B8",
	blue			: "#0058F8",
	lightblue		: "#3CBCFC",
	darkblue		: "#0000BC",
	purple			: "#6644FC",
	pink			: "#F878F8"
	},

	atari : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#909090",
	darkgrey		: "#404040",
	lightgrey		: "#b0b0b0",
	gray			: "#909090",
	darkgray		: "#404040",
	lightgray		: "#b0b0b0",
	red				: "#A03C50",
	darkred			: "#700014",
	lightred		: "#DC849C",
	brown			: "#805020",
	darkbrown		: "#703400",
	lightbrown		: "#CB9870",
	orange			: "#CCAC70",
	yellow 			: "#ECD09C",
	green			: "#58B06C",
	darkgreen		: "#006414",
	lightgreen		: "#70C484",
	blue			: "#1C3C88",
	lightblue		: "#6888C8",
	darkblue		: "#000088",
	purple			: "#3C0080",
	pink			: "#B484DC"
	},
	pastel : {
	black   		: "#000000",
	white			: "#FFFFFF",
	grey			: "#3e3e3e",
	darkgrey		: "#313131",
	lightgrey		: "#9cbcbc",
	gray			: "#3e3e3e",
	darkgray		: "#313131",
	lightgray		: "#9cbcbc",
	red				: "#f56ca2",
	darkred			: "#a63577",
	lightred		: "#ffa9cf",
	brown			: "#b58c53",
	darkbrown		: "#787562",
	lightbrown		: "#B58C53",
	orange			: "#EB792D",
	yellow 			: "#FFe15F",
	green			: "#00FF4F",
	darkgreen		: "#2b732c",
	lightgreen		: "#97c04f",
	blue			: "#0f88d3",
	lightblue		: "#00fffe",
	darkblue		: "#293a7b",
	purple			: "#ff6554",
	pink			: "#eb792d"
	},
	ega : {
	black   		: "#000000",
	white			: "#ffffff",
	grey			: "#555555",
	darkgrey		: "#555555",
	lightgrey		: "#aaaaaa",
	gray			: "#555555",
	darkgray		: "#555555",
	lightgray		: "#aaaaaa",
	red				: "#ff5555",
	darkred			: "#aa0000",
	lightred		: "#ff55ff",
	brown			: "#aa5500",
	darkbrown		: "#aa5500",
	lightbrown		: "#ffff55",
	orange			: "#ff5555",
	yellow 			: "#ffff55",
	green			: "#00aa00",
	darkgreen		: "#00aaaa",
	lightgreen		: "#55ff55",
	blue			: "#5555ff",
	lightblue		: "#55ffff",
	darkblue		: "#0000aa",
	purple			: "#aa00aa",
	pink			: "#ff55ff"
	},


	proteus_mellow : {
	black   		: "#3d2d2e",
	white			: "#ddf1fc",
	grey			: "#9fb2d4",
	darkgrey		: "#7b8272",
	lightgrey		: "#a4bfda",
	gray			: "#9fb2d4",
	darkgray		: "#7b8272",
	lightgray		: "#a4bfda",
	red				: "#9d5443",
	darkred			: "#8c5b4a",
	lightred		: "#94614c",
	brown			: "#89a78d",
	darkbrown		: "#829e88",
	lightbrown		: "#aaae97",
	orange			: "#d1ba86",
	yellow 			: "#d6cda2",
	green			: "#75ac8d",
	darkgreen		: "#8fa67f",
	lightgreen		: "#8eb682",
	blue			: "#88a3ce",
	lightblue		: "#a5adb0",
	darkblue		: "#5c6b8c",
	purple			: "#d39fac",
	pink			: "#c8ac9e"
	},
	

	proteus_night : {
	black   		: "#010912",
	white			: "#fdeeec",
	grey			: "#051d40",
	darkgrey		: "#091842",
	lightgrey		: "#062151",
	gray			: "#051d40",
	darkgray		: "#091842",
	lightgray		: "#062151",
	red				: "#ad4576",
	darkred			: "#934765",
	lightred		: "#ab6290",
	brown			: "#61646b",
	darkbrown		: "#3d2d2d",
	lightbrown		: "#8393a0",
	orange			: "#0a2227",
	yellow 			: "#0a2541",
	green			: "#75ac8d",
	darkgreen		: "#0a2434",
	lightgreen		: "#061f2e",
	blue			: "#0b2c79",
	lightblue		: "#809ccb",
	darkblue		: "#08153b",
	purple			: "#666a87",
	pink			: "#754b4d"
	},
	


	proteus_rich: {
	black   		: "#6f686f",
	white			: "#d1b1e2",
	grey			: "#b9aac1",
	darkgrey		: "#8e8b84",
	lightgrey		: "#c7b5cd",
	gray			: "#b9aac1",
	darkgray		: "#8e8b84",
	lightgray		: "#c7b5cd",
	red				: "#a11f4f",
	darkred			: "#934765",
	lightred		: "#c998ad",
	brown			: "#89867d",
	darkbrown		: "#797f75",
	lightbrown		: "#ab9997",
	orange			: "#ce8c5c",
	yellow 			: "#f0d959",
	green			: "#75bc54",
	darkgreen		: "#599d79",
	lightgreen		: "#90cf5c",
	blue			: "#8fd0ec",
	lightblue		: "#bcdce7",
	darkblue		: "#0b2c70",
	purple			: "#9b377f",
	pink			: "#cd88e5"
	},
	

	
amstrad : {
	black   		: "#000000",
	white			: "#ffffff",
	grey			: "#7f7f7f",
	darkgrey		: "#636363",
	lightgrey		: "#afafaf",
	gray			: "#7f7f7f",
	darkgray		: "#636363",
	lightgray		: "#afafaf",
	red				: "#ff0000",
	darkred			: "#7f0000",
	lightred		: "#ff7f7f",
	brown			: "#ff7f00",
	darkbrown		: "#7f7f00",
	lightbrown		: "#ffff00",
	orange			: "#ff007f",
	yellow 			: "#ffff7f",
	green			: "#01ff00",
	darkgreen		: "#007f00",
	lightgreen		: "#7fff7f",
	blue			: "#0000ff",
	lightblue		: "#7f7fff",
	darkblue		: "#00007f",
	purple			: "#7f007f",
	pink			: "#ff7fff"
	},
c64 : {
	black   		: "#000000",
	white			: "#ffffff",
	grey			: "#6C6C6C",
	darkgrey		: "#444444",
	lightgrey		: "#959595",
	gray			: "#6C6C6C",
	darkgray		: "#444444",
	lightgray		: "#959595",
	red				: "#68372B",
	darkred			: "#3f1e17",
	lightred		: "#9A6759",
	brown			: "#433900",
	darkbrown		: "#221c02",
	lightbrown		: "#6d5c0d",
	orange			: "#6F4F25",
	yellow 			: "#B8C76F",
	green			: "#588D43",
	darkgreen		: "#345129",
	lightgreen		: "#9AD284",
	blue			: "#6C5EB5",
	lightblue		: "#70A4B2",
	darkblue		: "#352879",
	purple			: "#6F3D86",
	pink			: "#b044ac"
},
whitingjp : {
  black       : "#202527",
  white       : "#eff8fd",
  grey        : "#7b7680",
  darkgrey    : "#3c3b44",
  lightgrey   : "#bed0d7",
  gray        : "#7b7680",
  darkgray    : "#3c3b44",
  lightgray   : "#bed0d7",
  red         : "#bd194b",
  darkred     : "#6b1334",
  lightred    : "#ef2358",
  brown       : "#b52e1c",
  darkbrown   : "#681c12",
  lightbrown  : "#e87b45",
  orange      : "#ff8c10",
  yellow      : "#fbd524",
  green       : "#36bc3c",
  darkgreen   : "#317610",
  lightgreen  : "#8ce062",
  blue        : "#3f62c6",
  lightblue   : "#57bbe0",
  darkblue    : "#2c2fa0",
  purple      : "#7037d9",
  pink        : "#ec2b8f"
}
};

var reg_color = /(black|white|gray|darkgray|lightgray|grey|darkgrey|lightgrey|red|darkred|lightred|brown|darkbrown|lightbrown|orange|yellow|green|darkgreen|lightgreen|blue|lightblue|darkblue|purple|pink|transparent|#(?:[0-9a-f]{3}){1,2})\s*/;

// STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

var StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
};

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function() {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
};

function blankLineHandle(state) {
    if (state.section === 'levels') {
            if (state.levels[state.levels.length - 1].length > 0)
            {
                state.levels.push([]);
            }
    } else if (state.section === 'objects') {
        state.objects_section = 0;
    }
}

//returns null if not delcared, otherwise declaration
//note to self: I don't think that aggregates or properties know that they're aggregates or properties in and of themselves.
function wordAlreadyDeclared(state,n) {
    n = n.toLowerCase();
    if (n in state.objects) {
        return state.objects[n];
    } 
    for (var i=0;i<state.legend_aggregates.length;i++) {
        var a = state.legend_aggregates[i];
        if (a[0]===n) {                                			
            return state.legend_aggregates[i];
        }
    }
    for (var i=0;i<state.legend_properties.length;i++) {
        var a = state.legend_properties[i];
        if (a[0]===n) {  
            return state.legend_properties[i];
        }
    }
    for (var i=0;i<state.legend_synonyms.length;i++) {
        var a = state.legend_synonyms[i];
        if (a[0]===n) {  
            return state.legend_synonyms[i];
        }
    }
    return null;
}

var codeMirrorFn = function() {
    'use strict';

    function checkNameDefined(state,candname) {
        if (state.objects[candname] !== undefined) {
            return;
        }
        for (var i=0;i<state.legend_synonyms.length;i++) {
            var entry = state.legend_synonyms[i];
            if (entry[0]==candname) {
                return;                                       
            }
        }
        for (var i=0;i<state.legend_aggregates.length;i++) {
            var entry = state.legend_aggregates[i];
            if (entry[0]==candname) {
                return;                                                                          
            }
        }
        for (var i=0;i<state.legend_properties.length;i++) {
            var entry = state.legend_properties[i];
            if (entry[0]==candname) {
                return;                                    
            }
        }
        
        logError(`You're talking about ${candname.toUpperCase()} but it's not defined anywhere.`, state.lineNumber);    
    }

    function registerOriginalCaseName(state,candname,mixedCase,lineNumber){

        function escapeRegExp(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        var nameFinder =  new RegExp("\\b"+escapeRegExp(candname)+"\\b","i")
        var match = mixedCase.match(nameFinder);
        if (match!=null){
            state.original_case_names[candname] = match[0];
            state.original_line_numbers[candname] = lineNumber;
        }
    }

    const absolutedirs = ['up', 'down', 'right', 'left'];
    const relativedirs = ['^', 'v', '<', '>', 'moving','stationary','parallel','perpendicular', 'no'];
    const logicWords = ['all', 'no', 'on', 'some'];
    const sectionNames = ['objects', 'legend', 'sounds', 'collisionlayers', 'rules', 'winconditions', 'levels'];
	const commandwords = ["sfx0","sfx1","sfx2","sfx3","sfx4","sfx5","sfx6","sfx7","sfx8","sfx9","sfx10","cancel","checkpoint","restart","win","message","again"];
    const reg_commands = /[\p{Z}\s]*(sfx0|sfx1|sfx2|sfx3|Sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10|cancel|checkpoint|restart|win|message|again)[\p{Z}\s]*/u;
    const reg_name = /[\p{L}\p{N}_]+[\p{Z}\s]*/u;///\w*[a-uw-zA-UW-Z0-9_]/;
    const reg_number = /[\d]+/;
    const reg_soundseed = /\d+\b/u;
    const reg_spriterow = /[\.0-9]{5}[\p{Z}\s]*/u;
    const reg_sectionNames = /(objects|collisionlayers|legend|sounds|rules|winconditions|levels)(?![\p{L}\p{N}_])[\p{Z}\s]*/u;
    const reg_equalsrow = /[\=]+/;
    const reg_notcommentstart = /[^\(]+/;
    const reg_match_until_commentstart_or_whitespace = /[^\p{Z}\s\()]+[\p{Z}\s]*/u;
    const reg_csv_separators = /[ \,]*/;
    const reg_soundverbs = /(move|action|create|destroy|cantmove)\b[\p{Z}\s]*/u;
    const soundverbs_directional = ['move','cantmove'];
    const reg_soundverbs_directional = /(move|cantmove)\b[\p{Z}\s]*/u;
    const reg_soundverbs_nondirectional = /(action|create|destroy)\b[\p{Z}\s]*/u;
    const reg_soundevents = /(undo|restart|titlescreen|startgame|cancel|endgame|startlevel|endlevel|showmessage|closemessage|sfx0|sfx1|sfx2|sfx3|sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10)\b[\p{Z}\s]*/u;

    const reg_directions = /^(action|up|down|left|right|\^|v|\<|\>|moving|stationary|parallel|perpendicular|horizontal|orthogonal|vertical|no|randomdir|random)$/;
    const reg_loopmarker = /^(startloop|endloop)$/;
    const reg_ruledirectionindicators = /^(up|down|left|right|horizontal|vertical|orthogonal|late|rigid)$/;
    const reg_sounddirectionindicators = /[\p{Z}\s]*(up|down|left|right|horizontal|vertical|orthogonal)(?![\p{L}\p{N}_])[\p{Z}\s]*/u;
    const reg_winconditionquantifiers = /^(all|any|no|some)$/;
    const reg_keywords = /(checkpoint|objects|collisionlayers|legend|sounds|rules|winconditions|\.\.\.|levels|up|down|left|right|^|\||\[|\]|v|\>|\<|no|horizontal|orthogonal|vertical|any|all|no|some|moving|stationary|parallel|perpendicular|action|move|action|create|destroy|cantmove|sfx0|sfx1|sfx2|sfx3|Sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10|cancel|checkpoint|restart|win|message|again|undo|restart|titlescreen|startgame|cancel|endgame|startlevel|endlevel|showmessage|closemessage)/;
    const keyword_array = ['checkpoint','objects', 'collisionlayers', 'legend', 'sounds', 'rules', '...','winconditions', 'levels','|','[',']','up', 'down', 'left', 'right', 'late','rigid', '^','v','\>','\<','no','randomdir','random', 'horizontal', 'vertical','any', 'all', 'no', 'some', 'moving','stationary','parallel','perpendicular','action','message', "move", "action", "create", "destroy", "cantmove", "sfx0", "sfx1", "sfx2", "sfx3", "Sfx4", "sfx5", "sfx6", "sfx7", "sfx8", "sfx9", "sfx10", "cancel", "checkpoint", "restart", "win", "message", "again", "undo", "restart", "titlescreen", "startgame", "cancel", "endgame", "startlevel", "endlevel", "showmessage", "closemessage"];

    function errorFallbackMatchToken(stream){
        var match=stream.match(reg_match_until_commentstart_or_whitespace, true);
        if (match===null){
            //just in case, I don't know for sure if it can happen but, just in case I don't 
            //understand unicode and the above doesn't match anything, force some match progress.
            match=stream.match(reg_notcommentstart, true);                                    
        }
        return match;
    }
    
    function processLegendLine(state, mixedCase){
        var ok=true;
        var splits = state.current_line_wip_array;
        if (splits.length===0){
            return;
        }

        if (splits.length === 1) {
            logError('Incorrect format of legend - should be one of "A = B", "A = B or C [ or D ...]", "A = B and C [ and D ...]".', state.lineNumber);
            ok=false;
        } else if (splits.length%2===0){
            logError(`Incorrect format of legend - should be one of "A = B", "A = B or C [ or D ...]", "A = B and C [ and D ...]", but it looks like you have a dangling "${state.current_line_wip_array[state.current_line_wip_array.length-1].toUpperCase()}"?`, state.lineNumber);
            ok=false;
        } else {
            var candname = splits[0];
            
            var alreadyDefined = wordAlreadyDeclared(state,candname);
            if (alreadyDefined!==null){
                logError(`Name "${candname.toUpperCase()}" already in use (on line <a onclick="jumpToLine(${alreadyDefined.lineNumber});" href="javascript:void(0);"><span class="errorTextLineNumber">line ${alreadyDefined.lineNumber}</span></a>).`, state.lineNumber);
                ok=false;
            }

            if (keyword_array.indexOf(candname)>=0) {
                logWarning('You named an object "' + candname.toUpperCase() + '", but this is a keyword. Don\'t do that!', state.lineNumber);
            }
        
        
            for (var i=2; i<splits.length; i+=2){
                var nname = splits[i];
                if (nname===candname){
                    logError("You can't define object " + candname.toUpperCase() + " in terms of itself!", state.lineNumber);
                    ok=false;
                    var idx = splits.indexOf(candname, 2);
                    while (idx >=2){
                        if (idx>=4){
                            splits.splice(idx-1, 2);
                        } else {
                            splits.splice(idx, 2);
                        }
                        idx = splits.indexOf(candname, 2);
                    }          
                }   
                for (var j=2;j<i;j+=2){
                    var oname = splits[j];
                    if(oname===nname){
                        logWarning("You're repeating the object " + oname.toUpperCase() + " here multiple times on the RHS.  This makes no sense.  Don't do that.", state.lineNumber);                        
                    }
                }                       
            } 

            //for every other word, check if it's a valid name
            for (var i=2;i<splits.length;i+=2){
                var defname = splits[i];
                if (defname!==candname){//we already have an error message for that just above.
                    checkNameDefined(state,defname);
                }
            }
        
            if (splits.length === 3) {
                //SYNONYM
                var synonym = [splits[0], splits[2]];
                synonym.lineNumber = state.lineNumber;
                registerOriginalCaseName(state,splits[0],mixedCase,state.lineNumber);
                state.legend_synonyms.push(synonym);
            } else if (splits[3]==='and'){
                //AGGREGATE
                var substitutor = function(n) {
                    n = n.toLowerCase();
                    if (n in state.objects) {
                        return [n];
                    } 
                    for (var i=0;i<state.legend_synonyms.length;i++) {
                        var a = state.legend_synonyms[i];
                        if (a[0]===n) {   
                            return substitutor(a[1]);
                        }
                    }
                    for (var i=0;i<state.legend_aggregates.length;i++) {
                        var a = state.legend_aggregates[i];
                        if (a[0]===n) {                                			
                            return [].concat.apply([],a.slice(1).map(substitutor));
                        }
                    }
                    for (var i=0;i<state.legend_properties.length;i++) {
                        var a = state.legend_properties[i];
                        if (a[0]===n) {         
                            logError("Cannot define an aggregate (using 'and') in terms of properties (something that uses 'or').", state.lineNumber);
                            ok=false;
                            return [n];
                        }
                    }
                    //seems like this shouldn't be reachable?
                    return [n];
                };
                                                
                var newlegend = [splits[0]].concat(substitutor(splits[2])).concat(substitutor(splits[4]));
                for (var i = 6; i < splits.length; i += 2) {
                    newlegend = newlegend.concat(substitutor(splits[i]));
                }
                newlegend.lineNumber = state.lineNumber;

                registerOriginalCaseName(state,newlegend[0],mixedCase,state.lineNumber);
                state.legend_aggregates.push(newlegend);
        
            } else if (splits[3]==='or'){
                var malformed=true;

                var substitutor = function(n) {

                    n = n.toLowerCase();
                    if (n in state.objects) {
                        return [n];
                    } 

                    for (var i=0;i<state.legend_synonyms.length;i++) {
                        var a = state.legend_synonyms[i];
                        if (a[0]===n) {   
                            return substitutor(a[1]);
                        }
                    }
                    for (var i=0;i<state.legend_aggregates.length;i++) {
                        var a = state.legend_aggregates[i];
                        if (a[0]===n) {           
                            logError("Cannot define a property (something defined in terms of 'or') in terms of aggregates (something that uses 'and').", state.lineNumber);
                            malformed=false;          
                        }
                    }
                    for (var i=0;i<state.legend_properties.length;i++) {
                        var a = state.legend_properties[i];
                        if (a[0]===n) {  
                            var result = [];
                            for (var j=1;j<a.length;j++){
                                if (a[j]===n){
                                    //error here superfluous, also detected elsewhere (cf 'You can't define object' / #789)
                                    //logError('Error, recursive definition found for '+n+'.', state.lineNumber);                                
                                } else {
                                    result = result.concat(substitutor(a[j]));
                                }
                            }
                            return result;
                        }
                    }
                    return [n];
                };

                for (var i = 5; i < splits.length; i += 2) {
                    if (splits[i].toLowerCase() !== 'or') {
                        malformed = false;
                        break;
                    }
                }
                if (malformed) {
                    var newlegend = [splits[0]].concat(substitutor(splits[2])).concat(substitutor(splits[4]));
                    for (var i = 6; i < splits.length; i += 2) {
                        newlegend.push(splits[i].toLowerCase());
                    }
                    newlegend.lineNumber = state.lineNumber;

                    registerOriginalCaseName(state,newlegend[0],mixedCase,state.lineNumber);
                    state.legend_properties.push(newlegend);
                }
            } else {
                if (ok){
                    //no it's not ok but we don't know why
                    logError('This legend-entry is incorrectly-formatted - it should be one of A = B, A = B or C ( or D ...), A = B and C (and D ...)', state.lineNumber);
                    ok=false;
                } 
            }                    
        }
    }

    function processSoundsLine(state){
        if (state.current_line_wip_array.length===0){
            return;
        }
        //if last entry in array is 'ERROR', do nothing
        if (state.current_line_wip_array[state.current_line_wip_array.length-1]==='ERROR'){

        } else {
            //take the first component from each pair in the array
            var soundrow = state.current_line_wip_array;//.map(function(a){return a[0];});
            soundrow.push(state.lineNumber);
            state.sounds.push(soundrow);
        }

    }

    // because of all the early-outs in the token function, this is really just right now attached
    // too places where we can early out during the legend. To make it more versatile we'd have to change 
    // all the early-outs in the token function to flag-assignment for returning outside the case 
    // statement.
    function endOfLineProcessing(state, mixedCase){
        if (state.section==='legend'){
            processLegendLine(state,mixedCase);
        } else if (state.section ==='sounds'){
            processSoundsLine(state);
        }
    }

    //  var keywordRegex = new RegExp("\\b(("+cons.join(")|(")+"))$", 'i');

    var fullSpriteMatrix = [
        '00000',
        '00000',
        '00000',
        '00000',
        '00000'
    ];

    return {
        copyState: function(state) {
            var objectsCopy = {};
            for (var i in state.objects) {
              if (state.objects.hasOwnProperty(i)) {
                var o = state.objects[i];
                objectsCopy[i] = {
                  colors: o.colors.concat([]),
                  lineNumber : o.lineNumber,
                  spritematrix: o.spritematrix.concat([])
                }
              }
            }

            var collisionLayersCopy = [];
            for (var i = 0; i < state.collisionLayers.length; i++) {
              collisionLayersCopy.push(state.collisionLayers[i].concat([]));
            }

            var legend_synonymsCopy = [];
            var legend_aggregatesCopy = [];
            var legend_propertiesCopy = [];
            var soundsCopy = [];
            var levelsCopy = [];
            var winConditionsCopy = [];
            var rulesCopy = [];

            for (var i = 0; i < state.legend_synonyms.length; i++) {
              legend_synonymsCopy.push(state.legend_synonyms[i].concat([]));
            }
            for (var i = 0; i < state.legend_aggregates.length; i++) {
              legend_aggregatesCopy.push(state.legend_aggregates[i].concat([]));
            }
            for (var i = 0; i < state.legend_properties.length; i++) {
              legend_propertiesCopy.push(state.legend_properties[i].concat([]));
            }
            for (var i = 0; i < state.sounds.length; i++) {
              soundsCopy.push(state.sounds[i].concat([]));
            }
            for (var i = 0; i < state.levels.length; i++) {
              levelsCopy.push(state.levels[i].concat([]));
            }
            for (var i = 0; i < state.winconditions.length; i++) {
              winConditionsCopy.push(state.winconditions[i].concat([]));
            }
            for (var i = 0; i < state.rules.length; i++) {
              rulesCopy.push(state.rules[i].concat([]));
            }

            var original_case_namesCopy = Object.assign({},state.original_case_names);
            var original_line_numbersCopy = Object.assign({},state.original_line_numbers);
            
            var nstate = {
              lineNumber: state.lineNumber,

              objects: objectsCopy,
              collisionLayers: collisionLayersCopy,

              commentLevel: state.commentLevel,
              section: state.section,
              visitedSections: state.visitedSections.concat([]),

              line_should_end: state.line_should_end,
              line_should_end_because: state.line_should_end_because,
              sol_after_comment: state.sol_after_comment,

              objects_candname: state.objects_candname,
              objects_section: state.objects_section,
              objects_spritematrix: state.objects_spritematrix.concat([]),

              tokenIndex: state.tokenIndex,

              current_line_wip_array: state.current_line_wip_array.concat([]),

              legend_synonyms: legend_synonymsCopy,
              legend_aggregates: legend_aggregatesCopy,
              legend_properties: legend_propertiesCopy,

              sounds: soundsCopy,

              rules: rulesCopy,

              names: state.names.concat([]),

              winconditions: winConditionsCopy,

              original_case_names : original_case_namesCopy,
              original_line_numbers : original_line_numbersCopy,

              abbrevNames: state.abbrevNames.concat([]),

              metadata : state.metadata.concat([]),
              metadata_lines: Object.assign({}, state.metadata_lines),

              levels: levelsCopy,

              STRIDE_OBJ : state.STRIDE_OBJ,
              STRIDE_MOV : state.STRIDE_MOV
            };

            return nstate;        
        },
        blankLine: function(state) {
            if (state.section === 'levels') {
                    if (state.levels[state.levels.length - 1].length > 0)
                    {
                        state.levels.push([]);
                    }
            }
        },
        token: function(stream, state) {
           	var mixedCase = stream.string;
            var sol = stream.sol();
            if (sol) {
                
                state.current_line_wip_array = [];
                stream.string = stream.string.toLowerCase();
                state.tokenIndex=0;
                state.line_should_end = false;
                /*   if (state.lineNumber==undefined) {
                        state.lineNumber=1;
                }
                else {
                    state.lineNumber++;
                }*/

            }
            if (state.sol_after_comment){
                sol = true;
                state.sol_after_comment = false;
            }



            stream.eatWhile(/[ \t]/);

            ////////////////////////////////
            // COMMENT PROCESSING BEGIN
            ////////////////////////////////

            //NESTED COMMENTS
            var ch = stream.peek();
            if (ch === '(' && state.tokenIndex !== -4) { // tokenIndex -4 indicates message command
                stream.next();
                state.commentLevel++;
            } else if (ch === ')') {
                stream.next();
                if (state.commentLevel > 0) {
                    state.commentLevel--;
                    if (state.commentLevel === 0) {
                        return 'comment';
                    }
                } else {
                    logWarning("You're trying to close a comment here, but I can't find any opening bracket to match it? [This is highly suspicious; you probably want to fix it.]",state.lineNumber);
                    return 'ERROR';
                }
            }
            if (state.commentLevel > 0) {
                if (sol) {
                    state.sol_after_comment = true;
                }
                while (true) {
                    stream.eatWhile(/[^\(\)]+/);

                    if (stream.eol()) {
                        break;
                    }

                    ch = stream.peek();

                    if (ch === '(') {
                        state.commentLevel++;
                    } else if (ch === ')') {
                        state.commentLevel--;
                    }
                    stream.next();

                    if (state.commentLevel === 0) {
                        break;
                    }
                }
                
                if (stream.eol()){
                    endOfLineProcessing(state,mixedCase);  
                }
                return 'comment';
            }

            stream.eatWhile(/[ \t]/);

            if (sol && stream.eol()) {                
                endOfLineProcessing(state,mixedCase);  
                return blankLineHandle(state);
            }

            if (state.line_should_end && !stream.eol()) {
                logError('Only comments should go after ' + state.line_should_end_because + ' on a line.', state.lineNumber);
                stream.skipToEnd();
                return 'ERROR';
            }            

            //MATCH '==="s AT START OF LINE
            if (sol && stream.match(reg_equalsrow, true)) {
                state.line_should_end = true;
                state.line_should_end_because = 'a bunch of equals signs (\'===\')';
                return 'EQUALSBIT';
            }

            //MATCH SECTION NAME
            var sectionNameMatches = stream.match(reg_sectionNames, true);
            if (sol && sectionNameMatches ) {

                state.section = sectionNameMatches[0].trim();
                if (state.visitedSections.indexOf(state.section) >= 0) {
                    logError('cannot duplicate sections (you tried to duplicate \"' + state.section.toUpperCase() + '").', state.lineNumber);
                }
                state.line_should_end = true;
                state.line_should_end_because = `a section name ("${state.section.toUpperCase()}")`;
                state.visitedSections.push(state.section);
                var sectionIndex = sectionNames.indexOf(state.section);
                if (sectionIndex == 0) {
                    state.objects_section = 0;
                    if (state.visitedSections.length > 1) {
                        logError('section "' + state.section.toUpperCase() + '" must be the first section', state.lineNumber);
                    }
                } else if (state.visitedSections.indexOf(sectionNames[sectionIndex - 1]) == -1) {
                    if (sectionIndex===-1) {
                        //honestly not sure how I could get here.
                        logError('no such section as "' + state.section.toUpperCase() + '".', state.lineNumber);
                    } else {
                        logError('section "' + state.section.toUpperCase() + '" is out of order, must follow  "' + sectionNames[sectionIndex - 1].toUpperCase() + '" (or it could be that the section "'+sectionNames[sectionIndex - 1].toUpperCase()+`"is just missing totally.  You have to include all section headings, even if the section itself is empty).`, state.lineNumber);                            
                    }
                }

                if (state.section === 'sounds') {
                    //populate names from rules
                    for (var n in state.objects) {
                        if (state.objects.hasOwnProperty(n)) {
/*                                if (state.names.indexOf(n)!==-1) {
                                logError('Object "'+n+'" has been declared to be multiple different things',state.objects[n].lineNumber);
                            }*/
                            state.names.push(n);
                        }
                    }
                    //populate names from legends
                    for (var i = 0; i < state.legend_synonyms.length; i++) {
                        var n = state.legend_synonyms[i][0];
                        /*
                        if (state.names.indexOf(n)!==-1) {
                            logError('Object "'+n+'" has been declared to be multiple different things',state.legend_synonyms[i].lineNumber);
                        }
                        */
                        state.names.push(n);
                    }
                    for (var i = 0; i < state.legend_aggregates.length; i++) {
                        var n = state.legend_aggregates[i][0];
                        /*
                        if (state.names.indexOf(n)!==-1) {
                            logError('Object "'+n+'" has been declared to be multiple different things',state.legend_aggregates[i].lineNumber);
                        }
                        */
                        state.names.push(n);
                    }
                    for (var i = 0; i < state.legend_properties.length; i++) {
                        var n = state.legend_properties[i][0];
                        /*
                        if (state.names.indexOf(n)!==-1) {
                            logError('Object "'+n+'" has been declared to be multiple different things',state.legend_properties[i].lineNumber);
                        }                           
                        */ 
                        state.names.push(n);
                    }
                }
                else if (state.section === 'levels') {
                    //populate character abbreviations
                    for (var n in state.objects) {
                        if (state.objects.hasOwnProperty(n) && n.length == 1) {
                            state.abbrevNames.push(n);
                        }
                    }

                    for (var i = 0; i < state.legend_synonyms.length; i++) {
                        if (state.legend_synonyms[i][0].length == 1) {
                            state.abbrevNames.push(state.legend_synonyms[i][0]);
                        }
                    }
                    for (var i = 0; i < state.legend_aggregates.length; i++) {
                        if (state.legend_aggregates[i][0].length == 1) {
                            state.abbrevNames.push(state.legend_aggregates[i][0]);
                        }
                    }
                }
                return 'HEADER';
            } else {
                if (state.section === undefined) {
                    //unreachable I think, pre-empted caught above
                    logError('must start with section "OBJECTS"', state.lineNumber);
                }
            }

            if (stream.eol()) {
                
                endOfLineProcessing(state,mixedCase);  
                return null;
            }

            //if color is set, try to set matrix
            //if can't set matrix, try to parse name
            //if color is not set, try to parse color
            switch (state.section) {
            case 'objects':
                {
                    var tryParseName = function() {
                        //LOOK FOR NAME
                        var match_name = sol ? stream.match(reg_name, true) : stream.match(/[^\p{Z}\s\()]+[\p{Z}\s]*/u,true);
                        if (match_name == null) {
                            stream.match(reg_notcommentstart, true);
                            if (stream.pos>0){                                
                                logWarning('Unknown junk in object section (possibly: sprites have to be 5 pixels wide and 5 pixels high exactly. Or maybe: the main names for objects have to be words containing only the letters a-z0.9 - if you want to call them something like ",", do it in the legend section).',state.lineNumber);
                            }
                            return 'ERROR';
                        } else {
                            var candname = match_name[0].trim();
                            if (state.objects[candname] !== undefined) {
                                logError('Object "' + candname.toUpperCase() + '" defined multiple times.', state.lineNumber);
                                return 'ERROR';
                            }
                            for (var i=0;i<state.legend_synonyms.length;i++) {
                                var entry = state.legend_synonyms[i];
                                if (entry[0]==candname) {
                                    logError('Name "' + candname.toUpperCase() + '" already in use.', state.lineNumber);                                		
                                }
                            }
                            if (keyword_array.indexOf(candname)>=0) {
                                logWarning('You named an object "' + candname.toUpperCase() + '", but this is a keyword. Don\'t do that!', state.lineNumber);
                            }

                            if (sol) {
                                state.objects_candname = candname;
                                registerOriginalCaseName(state,candname,mixedCase,state.lineNumber);
                                state.objects[state.objects_candname] = {
                                                                        lineNumber: state.lineNumber,
                                                                        colors: [],
                                                                        spritematrix: []
                                                                    };

                            } else {
                                //set up alias
                                registerOriginalCaseName(state,candname,mixedCase,state.lineNumber);
                                var synonym = [candname,state.objects_candname];
                                synonym.lineNumber = state.lineNumber;
                                state.legend_synonyms.push(synonym);
                            }
                            state.objects_section = 1;
                            return 'NAME';
                        }
                    };

                    if (sol && state.objects_section == 2) {
                        state.objects_section = 3;
                    }

                    if (sol && state.objects_section == 1) {
                        state.objects_section = 2;
                    }

                    switch (state.objects_section) {
                    case 0:
                    case 1:
                        {
                            state.objects_spritematrix = [];
                            return tryParseName();
                        }
                    case 2:
                        {
                            //LOOK FOR COLOR
                            state.tokenIndex = 0;

                            var match_color = stream.match(reg_color, true);
                            if (match_color == null) {
                                var str = stream.match(reg_name, true) || stream.match(reg_notcommentstart, true);
                                logError('Was looking for color for object ' + state.objects_candname.toUpperCase() + ', got "' + str + '" instead.', state.lineNumber);
                                return null;
                            } else {
                                if (state.objects[state.objects_candname].colors === undefined) {
                                    state.objects[state.objects_candname].colors = [match_color[0].trim()];
                                } else {
                                    state.objects[state.objects_candname].colors.push(match_color[0].trim());
                                }

                                var candcol = match_color[0].trim().toLowerCase();
                                if (candcol in colorPalettes.arnecolors) {
                                    return 'COLOR COLOR-' + candcol.toUpperCase();
                                } else if (candcol==="transparent") {
                                    return 'COLOR FADECOLOR';
                                } else {
                                    return 'MULTICOLOR'+match_color[0];
                                }
                            }
                        }
                    case 3:
                        {
                            var ch = stream.eat(/[.\d]/);
                            var spritematrix = state.objects_spritematrix;
                            if (ch === undefined) {
                                if (spritematrix.length === 0) {
                                    return tryParseName();
                                }
                                logError('Unknown junk in spritematrix for object ' + state.objects_candname.toUpperCase() + '.', state.lineNumber);
                                stream.match(reg_notcommentstart, true);
                                return null;
                            }

                            if (sol) {
                                spritematrix.push('');
                            }

                            var o = state.objects[state.objects_candname];

                            spritematrix[spritematrix.length - 1] += ch;
                            if (spritematrix[spritematrix.length-1].length>5){
                                logWarning('Sprites must be 5 wide and 5 high.', state.lineNumber);
                                stream.match(reg_notcommentstart, true);
                                return null;
                            }
                            o.spritematrix = state.objects_spritematrix;
                            if (spritematrix.length === 5 && spritematrix[spritematrix.length - 1].length == 5) {
                                state.objects_section = 0;
                            }

                            if (ch!=='.') {
                                var n = parseInt(ch);
                                if (n>=o.colors.length) {
                                    logError("Trying to access color number "+n+" from the color palette of sprite " +state.objects_candname.toUpperCase()+", but there are only "+o.colors.length+" defined in it.",state.lineNumber);
                                    return 'ERROR';
                                }
                                return 'COLOR BOLDCOLOR COLOR-' + o.colors[n].toUpperCase();
                            }
                            return 'COLOR FADECOLOR';
                        }
                    default:
                        {
                        window.console.logError("EEK shouldn't get here.");
                        }
                    }
                    break;
                }
            case 'legend':
                {
                    var resultToken="";
                    var match_name=null;
                    if (state.tokenIndex === 0) {
                        match_name=stream.match(/[^=\p{Z}\s\(]*(\p{Z}\s)*/u, true);
                        var new_name=match_name[0].trim();
                        
                        if (wordAlreadyDeclared(state,new_name))
                        {
                            resultToken =  'ERROR';
                        } else {
                            resultToken =  'NAME';    
                        }

                        //if name already declared, we have a problem                            
                        state.tokenIndex++;
                    } else if (state.tokenIndex === 1) {
                        match_name = stream.match(/=/u,true);                              
                        if (match_name===null||match_name[0].trim()!=="="){
                            logError(`In the legend, define new items using the equals symbol - declarations must look like "A = B", "A = B or C [ or D ...]", "A = B and C [ and D ...]".`, state.lineNumber);
                            stream.match(reg_notcommentstart, true);
                            resultToken = 'ERROR';
                            match_name=["ERROR"];//just to reduce the chance of crashes
                        }
                        stream.match(/[\p{Z}\s]*/u, true);
                        state.tokenIndex++;
                        resultToken = 'ASSSIGNMENT';
                    } else if (state.tokenIndex >= 3 && ((state.tokenIndex % 2) === 1)) {
                        //matches AND/OR
                        match_name = stream.match(reg_name, true);
                        if (match_name === null) {
                            logError("Something bad's happening in the LEGEND", state.lineNumber);
                            match=stream.match(reg_notcommentstart, true);
                            resultToken = 'ERROR';
                        } else {
                            var candname = match_name[0].trim();
                            if (candname === "and" || candname === "or"){                                             
                                resultToken =  'LOGICWORD';
                                if (state.tokenIndex>=5){
                                    if (candname !== state.current_line_wip_array[3]){
                                        logError("Hey! You can't go mixing ANDs and ORs in a single legend entry.", state.lineNumber);
                                        resultToken = 'ERROR';
                                    }
                                }
                            } else {
                                logError(`Expected and 'AND' or an 'OR' here, but got ${candname.toUpperCase()} instead. In the legend, define new items using the equals symbol - declarations must look like 'A = B' or 'A = B and C' or 'A = B or C'.`, state.lineNumber);
                                resultToken = 'ERROR';
                                // match_name=["and"];//just to reduce the chance of crashes
                            }
                        }
                        state.tokenIndex++;
                    }
                    else {
                        match_name = stream.match(reg_name, true);
                        if (match_name === null) {
                            logError("Something bad's happening in the LEGEND", state.lineNumber);
                            match=stream.match(reg_notcommentstart, true);
                            resultToken = 'ERROR';
                        } else {
                            var candname = match_name[0].trim();
                            if (wordAlreadyDeclared(state,candname))
                            {
                                resultToken =  'NAME';    
                            } else {
                                resultToken =  'ERROR';
                            }
                            state.tokenIndex++;

                        }
                    }

                    if (match_name!==null){
                        state.current_line_wip_array.push(match_name[0].trim());
                    }
                    
                    if (stream.eol()){
                        processLegendLine(state,mixedCase);
                    }               

                    return resultToken;
                    break;
                }
            case 'sounds':
                {
                    /*
                    SOUND DEFINITION:
                        SOUNDEVENT ~ INT (Sound events take precedence if there's name overlap)
                        OBJECT_NAME
                            NONDIRECTIONAL_VERB ~ INT
                            DIRECTIONAL_VERB
                                INT
                                DIR+ ~ INT
                    */
                    var tokentype="";

                    if (state.current_line_wip_array.length>0 && state.current_line_wip_array[state.current_line_wip_array.length-1]==='ERROR'){
                        // match=stream.match(reg_notcommentstart, true);
                        //if there was an error earlier on the line just try to do greedy matching here
                        var match = null;

                        //events
                        if (match === null) { 
                            match = stream.match(reg_soundevents, true);
                            if (match !== null) { 
                                tokentype = 'SOUNDEVENT';
                            }
                        }

                        //verbs
                        if (match === null) { 
                            match = stream.match(reg_soundverbs, true);
                            if (match !== null) {
                                tokentype = 'SOUNDVERB';
                            }
                        }
                        //directions
                        if (match === null) { 
                            match = stream.match(reg_sounddirectionindicators, true);
                            if (match !== null) {
                                tokentype = 'DIRECTION';
                            }
                        }

                        //sound seeds
                        if (match === null) {                                           
                            var match = stream.match(reg_soundseed, true);
                            if (match !== null)
                            {
                                tokentype = 'SOUND';
                            }
                        }

                        //objects
                        if (match === null) { 
                            match = stream.match(reg_name, true);
                            if (match !== null) {
                                if (wordAlreadyDeclared(state, match[0].trim())){
                                    tokentype = 'NAME';
                                } else {
                                    tokentype = 'ERROR';                   
                                }
                            }                          
                        }

                        //error
                        if (match === null) { 
                            match = errorFallbackMatchToken(stream);
                            tokentype = 'ERROR';                            
                        }


                    } else if (state.current_line_wip_array.length===0){
                        //can be OBJECT_NAME or SOUNDEVENT
                        var match = stream.match(reg_soundevents, true);
                        if (match == null){
                            match = stream.match(reg_name, true);
                            if (match == null ){
                                tokentype = 'ERROR';
                                match=errorFallbackMatchToken(stream);
                                state.current_line_wip_array.push("ERROR");
                                logWarning("Was expecting a sound event (like SFX3, or ENDLEVEL) or an object name, but didn't find either.", state.lineNumber);                        
                            } else {
                                var matched_name = match[0].trim();
                                if (!wordAlreadyDeclared(state, matched_name)){                 
                                    tokentype = 'ERROR';
                                    state.current_line_wip_array.push("ERROR");
                                    logError(`unexpected sound token "${matched_name}".`, state.lineNumber);
                                } else {                                    
                                    tokentype = 'NAME';
                                    state.current_line_wip_array.push([matched_name,tokentype]);    
                                    state.tokenIndex++;
                                }
                            }
                        } else {
                            tokentype = 'SOUNDEVENT';
                            state.current_line_wip_array.push([match[0].trim(),tokentype]);  
                            state.tokenIndex++;  
                        }

                    } else if (state.current_line_wip_array.length===1) {
                        var is_soundevent = state.current_line_wip_array[0][1] === 'SOUNDEVENT';

                        if (is_soundevent){                            
                            var match = stream.match(reg_soundseed, true);
                            if (match !== null)
                            {
                                tokentype = 'SOUND';
                                state.current_line_wip_array.push([match[0].trim(),tokentype]);
                                state.tokenIndex++;
                            } else {
                                match=errorFallbackMatchToken(stream);
                                logError("Was expecting a sound seed here (a number like 123123, like you generate by pressing the buttons above the console panel), but found something else.", state.lineNumber);                                
                                tokentype = 'ERROR';
                                state.current_line_wip_array.push("ERROR");
                            }
                        } else {
                            //[0] is object name
                            //it's a sound verb
                            var match = stream.match(reg_soundverbs, true);
                            if (match !== null){
                                tokentype = 'SOUNDVERB';
                                state.current_line_wip_array.push([match[0].trim(),tokentype]);
                                state.tokenIndex++;
                            } else {
                                match=errorFallbackMatchToken(stream);
                                logError("Was expecting a soundverb here (MOVE, DESTROY, CANTMOVE, or the like), but found something else.", state.lineNumber);                                
                                tokentype = 'ERROR';
                                state.current_line_wip_array.push("ERROR");
                            }
                            
                        }
                    } else {
                        var is_soundevent = state.current_line_wip_array[0][1] === 'SOUNDEVENT';
                        if (is_soundevent){
                            match=errorFallbackMatchToken(stream);
                            logError(`I wasn't expecting anything after the sound declaration ${state.current_line_wip_array[state.current_line_wip_array.length-1][0].toUpperCase()} on this line, so I don't know what to do with "${match[0].trim().toUpperCase()}" here.`, state.lineNumber);
                            tokentype = 'ERROR';
                            state.current_line_wip_array.push("ERROR");
                        } else {                            
                            //if there's a seed on the right, any additional content is superfluous
                            var is_seedonright = state.current_line_wip_array[state.current_line_wip_array.length-1][1] === 'SOUND';
                            if (is_seedonright){
                                match=errorFallbackMatchToken(stream);
                                logError(`I wasn't expecting anything after the sound declaration ${state.current_line_wip_array[state.current_line_wip_array.length-1][0].toUpperCase()} on this line, so I don't know what to do with "${match[0].trim().toUpperCase()}" here.`, state.lineNumber);
                                tokentype = 'ERROR';
                                state.current_line_wip_array.push("ERROR");
                            } else {
                                var directional_verb = soundverbs_directional.indexOf(state.current_line_wip_array[1][0])>=0;    
                                if (directional_verb){  
                                    //match seed or direction                          
                                    var is_direction = stream.match(reg_sounddirectionindicators, true);
                                    if (is_direction !== null){
                                        tokentype = 'DIRECTION';
                                        state.current_line_wip_array.push([is_direction[0].trim(),tokentype]);
                                        state.tokenIndex++;
                                    } else {
                                        var is_seed = stream.match(reg_soundseed, true);
                                        if (is_seed !== null){
                                            tokentype = 'SOUND';
                                            state.current_line_wip_array.push([is_seed[0].trim(),tokentype]);
                                            state.tokenIndex++;
                                        } else {
                                            match=errorFallbackMatchToken(stream);
                                            //depending on whether the verb is directional or not, we log different errors
                                            logError(`Ah I was expecting direction or a sound seed here after ${state.current_line_wip_array[state.current_line_wip_array.length-1][0].toUpperCase()}, but I don't know what to make of "${match[0].trim().toUpperCase()}".`, state.lineNumber);
                                            tokentype = 'ERROR';
                                            state.current_line_wip_array.push("ERROR");
                                        }
                                    }
                                } else {
                                    //only match seed
                                    var is_seed = stream.match(reg_soundseed, true);
                                    if (is_seed !== null){
                                        tokentype = 'SOUND';
                                        state.current_line_wip_array.push([is_seed[0].trim(),tokentype]);
                                        state.tokenIndex++;
                                    } else {
                                        match=errorFallbackMatchToken(stream);
                                        //depending on whether the verb is directional or not, we log different errors
                                        logError(`Ah I was expecting a sound seed here after ${state.current_line_wip_array[state.current_line_wip_array.length-1][0].toUpperCase()}, but I don't know what to make of "${match[0].trim().toUpperCase()}".`, state.lineNumber);
                                        tokentype = 'ERROR';
                                        state.current_line_wip_array.push("ERROR");
                                    }
                                }
                            }
                        }
                    }

                    if (stream.eol()){
                        processSoundsLine(state);
                    }     

                    return tokentype;
                }
            case 'collisionlayers':
                {
                    if (sol) {
                        //create new collision layer
                        state.collisionLayers.push([]);
                        //empty current_line_wip_array
                        state.current_line_wip_array = [];
                        state.tokenIndex=0;
                    }

                    var match_name = stream.match(reg_name, true);
                    if (match_name === null) {
                        //then strip spaces and commas
                        var prepos=stream.pos;
                        stream.match(reg_csv_separators, true);
                        if (stream.pos==prepos) {
                            logError("error detected - unexpected character " + stream.peek(),state.lineNumber);
                            stream.next();
                        }
                        return null;
                    } else {
                        //have a name: let's see if it's valid
                        var candname = match_name[0].trim();

                        var substitutor = function(n) {
                            n = n.toLowerCase();
                            if (n in state.objects) {
                                return [n];
                            } 


                            for (var i=0;i<state.legend_synonyms.length;i++) {
                                var a = state.legend_synonyms[i];
                                if (a[0]===n) {           
                                    return substitutor(a[1]);
                                }
                            }

                            for (var i=0;i<state.legend_aggregates.length;i++) {
                                var a = state.legend_aggregates[i];
                                if (a[0]===n) {           
                                    logError('"'+n+'" is an aggregate (defined using "and"), and cannot be added to a single layer because its constituent objects must be able to coexist.', state.lineNumber);
                                    return [];         
                                }
                            }
                            for (var i=0;i<state.legend_properties.length;i++) {
                                var a = state.legend_properties[i];
                                if (a[0]===n) {  
                                    var result = [];
                                    for (var j=1;j<a.length;j++){
                                        if (a[j]===n){
                                            //error here superfluous, also detected elsewhere (cf 'You can't define object' / #789)
                                            //logError('Error, recursive definition found for '+n+'.', state.lineNumber);                                
                                        } else {
                                            result = result.concat(substitutor(a[j]));
                                        }
                                    }
                                    return result;
                                }
                            }
                            logError('Cannot add "' + candname.toUpperCase() + '" to a collision layer; it has not been declared.', state.lineNumber);                                
                            return [];
                        };
                        if (candname==='background' ) {
                            if (state.collisionLayers.length>0&&state.collisionLayers[state.collisionLayers.length-1].length>0) {
                                logError("Background must be in a layer by itself.",state.lineNumber);
                            }
                            state.tokenIndex=1;
                        } else if (state.tokenIndex!==0) {
                            logError("Background must be in a layer by itself.",state.lineNumber);
                        }

                        var ar = substitutor(candname);

                        if (state.collisionLayers.length===0) {
                            //pre-empted by other messages
                            logError("no layers found.",state.lineNumber);
                            return 'ERROR';
                        }
                        
                        var foundOthers=[];
                        var foundSelves=[];
                        for (var i=0;i<ar.length;i++){
                            var tcandname = ar[i];
                            for (var j=0;j<=state.collisionLayers.length-1;j++){
                                var clj = state.collisionLayers[j];
                                if (clj.indexOf(tcandname)>=0){
                                    if (j!==state.collisionLayers.length-1){
                                        foundOthers.push(j);
                                    } else {
                                        foundSelves.push(j);
                                    }
                                }
                            }
                        }
                        if (foundOthers.length>0){
                            var warningStr = 'Object "'+candname.toUpperCase()+'" included in multiple collision layers ( layers ';
                            for (var i=0;i<foundOthers.length;i++){
                                warningStr+="#"+(foundOthers[i]+1)+", ";
                            }
                            warningStr+="#"+state.collisionLayers.length;
                            logWarning(warningStr +' ). You should fix this!',state.lineNumber);                                        
                        }

                        if (state.current_line_wip_array.indexOf(candname)>=0){
                            var warningStr = 'Object "'+candname.toUpperCase()+'" included explicitly multiple times in the same layer. Don\'t do that innit.';
                            logWarning(warningStr,state.lineNumber);         
                        }
                        state.current_line_wip_array.push(candname);

                        state.collisionLayers[state.collisionLayers.length - 1] = state.collisionLayers[state.collisionLayers.length - 1].concat(ar);
                        if (ar.length>0) {
                            return 'NAME';                            
                        } else {
                            return 'ERROR';
                        }
                    }
                    break;
                }
            case 'rules':
                {                    	
                    if (sol) {
                        var rule = reg_notcommentstart.exec(stream.string)[0];
                        state.rules.push([rule, state.lineNumber, mixedCase]);
                        state.tokenIndex = 0;//in rules, records whether bracket has been found or not
                    }

                    if (state.tokenIndex===-4) {
                        stream.skipToEnd();
                        return 'MESSAGE';
                    }
                    if (stream.match(/[\p{Z}\s]*->[\p{Z}\s]*/u, true)) {
                        return 'ARROW';
                    }
                    if (ch === '[' || ch === '|' || ch === ']' || ch==='+') {
                        if (ch!=='+') {
                            state.tokenIndex = 1;
                        }
                        stream.next();
                        stream.match(/[\p{Z}\s]*/u, true);
                        return 'BRACKET';
                    } else {
                        var m = stream.match(/[^\[\|\]\p{Z}\s]*/u, true)[0].trim();

                        if (state.tokenIndex===0&&reg_loopmarker.exec(m)) {
                            return 'BRACKET';
                        } else if (state.tokenIndex === 0 && reg_ruledirectionindicators.exec(m)) {
                            stream.match(/[\p{Z}\s]*/u, true);
                            return 'DIRECTION';
                        } else if (state.tokenIndex === 1 && reg_directions.exec(m)) {
                            stream.match(/[\p{Z}\s]*/u, true);
                            return 'DIRECTION';
                        } else {
                            if (state.names.indexOf(m) >= 0) {
                                if (sol) {
                                    logError('Objects cannot appear outside of square brackets in rules, only directions can.', state.lineNumber);
                                    return 'ERROR';
                                } else {
                                    stream.match(/[\p{Z}\s]*/u, true);
                                    return 'NAME';
                                }
                            } else if (m==='...') {
                                return 'DIRECTION';
                            } else if (m==='rigid') {
                                return 'DIRECTION';
                            } else if (m==='random') {
                                return 'DIRECTION';
                            } else if (commandwords.indexOf(m)>=0) {
                                if (m==='message') {
                                    state.tokenIndex=-4;
                                }                                	
                                return 'COMMAND';
                            } else {
                                logError('Name "' + m + '", referred to in a rule, does not exist.', state.lineNumber);
                                return 'ERROR';
                            }
                        }
                    }

                    break;
                }
            case 'winconditions':
                {
                    if (sol) {
                        var tokenized = reg_notcommentstart.exec(stream.string);
                        var splitted = tokenized[0].split(/[\p{Z}\s]/u);
                        var filtered = splitted.filter(function(v) {return v !== ''});
                        filtered.push(state.lineNumber);
                        
                        state.winconditions.push(filtered);
                        state.tokenIndex = -1;
                    }
                    state.tokenIndex++;

                    var match = stream.match(/[\p{Z}\s]*[\p{L}\p{N}_]+[\p{Z}\s]*/u);
                    if (match === null) {
                            logError('incorrect format of win condition.', state.lineNumber);
                            stream.match(reg_notcommentstart, true);
                            return 'ERROR';

                    } else {
                        var candword = match[0].trim();
                        if (state.tokenIndex === 0) {
                            if (reg_winconditionquantifiers.exec(candword)) {
                                return 'LOGICWORD';
                            }
                            else {
                                logError('Expecting the start of a win condition ("ALL","SOME","NO") but got "'+candword.toUpperCase()+"'.", state.lineNumber);
                                return 'ERROR';
                            }
                        }
                        else if (state.tokenIndex === 2) {
                            if (candword != 'on') {
                                logError('Expecting the word "ON" but got "'+candword.toUpperCase()+"\".", state.lineNumber);
                                return 'ERROR';
                            } else {
                                return 'LOGICWORD';
                            }
                        }
                        else if (state.tokenIndex === 1 || state.tokenIndex === 3) {
                            if (state.names.indexOf(candword)===-1) {
                                logError('Error in win condition: "' + candword.toUpperCase() + '" is not a valid object name.', state.lineNumber);
                                return 'ERROR';
                            } else {
                                return 'NAME';
                            }
                        } else {
                            logError("Error in win condition: I don't know what to do with "+candword.toUpperCase()+".", state.lineNumber);
                            return 'ERROR';
                        }
                    }
                    break;
                }
            case 'levels':
                {
                    if (sol)
                    {
                        if (stream.match(/[\p{Z}\s]*message\b[\p{Z}\s]*/u, true)) {
                            state.tokenIndex = -4;//-4/2 = message/level
                            var newdat = ['\n', mixedCase.slice(stream.pos).trim(),state.lineNumber];
                            if (state.levels[state.levels.length - 1].length == 0) {
                                state.levels.splice(state.levels.length - 1, 0, newdat);
                            } else {
                                state.levels.push(newdat);
                            }
                            return 'MESSAGE_VERB';//a duplicate of the previous section as a legacy thing for #589 
                        } else if (stream.match(/[\p{Z}\s]*message[\p{Z}\s]*/u, true)) {//duplicating previous section because of #589
                            logWarning("You probably meant to put a space after 'message' innit.  That's ok, I'll still interpret it as a message, but you probably want to put a space there.",state.lineNumber);
                            state.tokenIndex = -4;//-4/2 = message/level
                            var newdat = ['\n', mixedCase.slice(stream.pos).trim(),state.lineNumber];
                            if (state.levels[state.levels.length - 1].length == 0) {
                                state.levels.splice(state.levels.length - 1, 0, newdat);
                            } else {
                                //don't seem to ever reach this.
                                state.levels.push(newdat);
                            }
                            return 'MESSAGE_VERB';
                        } else {
                            var matches = stream.match(reg_notcommentstart, false);
                            if (matches===null || matches.length===0){
                                //not sure if it's possible to get here.
                                logError("Detected a comment where I was expecting a level. Oh gosh; if this is to do with you using '(' as a character in the legend, please don't do that ^^",state.lineNumber);
                                state.commentLevel++;
                                stream.skipToEnd();
                                return 'comment';
                            } else {
                                var line = matches[0].trim();
                                state.tokenIndex = 2;
                                var lastlevel = state.levels[state.levels.length - 1];
                                if (lastlevel[0] == '\n') {
                                    state.levels.push([state.lineNumber,line]);
                                } else {
                                    if (lastlevel.length==0)
                                    {
                                        lastlevel.push(state.lineNumber);
                                    }
                                    lastlevel.push(line);  

                                    if (lastlevel.length>1) 
                                    {
                                        if (line.length!=lastlevel[1].length) {
                                            logWarning("Maps must be rectangular, yo (In a level, the length of each row must be the same).",state.lineNumber);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (state.tokenIndex == -4) {
                            stream.skipToEnd();
                            return 'MESSAGE';
                        }
                    }

                    if (state.tokenIndex === 2 && !stream.eol()) {
                        var ch = stream.peek();
                        stream.next();
                        if (state.abbrevNames.indexOf(ch) >= 0) {
                            return 'LEVEL';
                        } else {
                            logError('Key "' + ch.toUpperCase() + '" not found. Do you need to add it to the legend, or define a new object?', state.lineNumber);
                            return 'ERROR';
                        }
                    }
                    break;
                }
                
                default://if you're in the preamble
                {
                    if (sol) {
                        state.tokenIndex=0;
                    }
                    if (state.tokenIndex==0) {
                        var match = stream.match(/[\p{Z}\s]*[\p{L}\p{N}_]+[\p{Z}\s]*/u);	                    
                        if (match!==null) {
                            var token = match[0].trim();
                            if (sol) {
                                if (['title','author','homepage','background_color','text_color','key_repeat_interval','realtime_interval','again_interval','flickscreen','zoomscreen','color_palette','youtube'].indexOf(token)>=0) {
                                    
                                    if (token==='author' || token==='homepage' || token==='title') {
                                        stream.string=mixedCase;
                                    }

                                    if (token==="youtube") {
                                        logWarning("Unfortunately, YouTube support hasn't been working properly for a long time - it was always a hack and it hasn't gotten less hacky over time, so I can no longer pretend to support it.",state.lineNumber);
                                    }
                                    
                                    var m2 = stream.match(reg_notcommentstart, false);
                                    
                                    if(m2!==null) {
                                        state.metadata.push(token);
                                        state.metadata.push(m2[0].trim());  
                                        if (token in state.metadata_lines){
                                            var otherline = state.metadata_lines[token];
                                            logWarning(`You've already defined a ${token.toUpperCase()} in the prelude on line <a onclick="jumpToLine(${otherline})>${otherline}</a>.`,state.lineNumber);
                                        }
                                        state.metadata_lines[token]=state.lineNumber;                                                                                    
                                    } else {
                                        logError('MetaData "'+token+'" needs a value.',state.lineNumber);
                                    }
                                    state.tokenIndex=1;
                                    return 'METADATA';
                                } else if ( ['run_rules_on_level_start','norepeat_action','require_player_movement','debug','verbose_logging','throttle_movement','noundo','noaction','norestart','scanline'].indexOf(token)>=0) {
                                    state.metadata.push(token);
                                    state.metadata.push("true");
                                    state.tokenIndex=-1;


                                    var m2 = stream.match(reg_notcommentstart, false);
                                    
                                    if(m2!==null) {
                                        var extra = m2[0].trim();      
                                        logWarning('MetaData '+token.toUpperCase()+' doesn\'t take any parameters, but you went and gave it "'+extra+'".',state.lineNumber);                                      
                                    } 

                                    return 'METADATA';
                                } else  {
                                    logError('Unrecognised stuff in the prelude.', state.lineNumber);
                                    return 'ERROR';
                                }
                            } else if (state.tokenIndex==-1) {
                                //no idea how to get here. covered with a similar error message above.
                                logError('MetaData "'+token+'" has no parameters.',state.lineNumber);
                                return 'ERROR';
                            }
                            return 'METADATA';
                        }       
                    } else {
                        stream.match(reg_notcommentstart, true);
                        state.tokenIndex++;

                        var key = state.metadata[state.metadata.length-2];
                        var val = state.metadata[state.metadata.length-1];

                        if( state.tokenIndex>2){
                            logWarning("Error: you can't embed comments in metadata values. Anything after the comment will be ignored.",state.lineNumber);
                            return 'ERROR';
                        }
						if (key === "background_color" || key === "text_color"){
							var candcol = val.trim().toLowerCase();
                            if (candcol in colorPalettes.arnecolors) {
                                return 'COLOR COLOR-' + candcol.toUpperCase();
                            } else if (candcol==="transparent") {
                                return 'COLOR FADECOLOR';
                            } else if ( (candcol.length===4) || (candcol.length===7)) {
                                var color = candcol.match(/#[0-9a-fA-F]+/);
                                if (color!==null){                
                                    return 'MULTICOLOR'+color[0];
                                }
                            }
                                                       
						}                        
                        return "METADATATEXT";
                    }
                    break;
                }
            }
        

            if (stream.eol()) {
                //don't know how to reach this.
                return null;
            }

            if (!stream.eol()) {
                stream.next();
                return null;
            }
        },
        startState: function() {
            return {
                /*
                    permanently useful
                */
                objects: {},

                /*
                    for parsing
                */
                lineNumber: 0,

                commentLevel: 0,

                section: '',
                visitedSections: [],

                line_should_end: false,
                line_should_end_because: '',
                sol_after_comment: false,

                objects_candname: '',
                objects_section: 0, //whether reading name/color/spritematrix
                objects_spritematrix: [],

                collisionLayers: [],

                tokenIndex: 0,

                current_line_wip_array: [],

                legend_synonyms: [],
                legend_aggregates: [],
                legend_properties: [],

                sounds: [],
                rules: [],

                names: [],

                winconditions: [],
                metadata: [],
                metadata_lines: {},

                original_case_names: {},
                original_line_numbers: {},

                abbrevNames: [],

                levels: [[]],

                subsection: ''
            };
        }
    };
};

/**
 * Seedable random number generator functions.
 * @version 1.0.0
 * @license Public Domain
 *
 * @example
 * var rng = new RNG('Example');
 * rng.random(40, 50);  // =>  42
 * rng.uniform();       // =>  0.7972798995050903
 * rng.normal();        // => -0.6698504543216376
 * rng.exponential();   // =>  1.0547367609131555
 * rng.poisson(4);      // =>  2
 * rng.gamma(4);        // =>  2.781724687386858
 */

/**
 * Get the underlying bytes of this string.
 * @return {Array} An array of bytes
 */
String.prototype.getBytes = function() {
    var output = [];
    for (var i = 0; i < this.length; i++) {
        var c = this.charCodeAt(i);
        var bytes = [];
        do {
            bytes.push(c & 0xFF);
            c = c >> 8;
        } while (c > 0);
        output = output.concat(bytes.reverse());
    }
    return output;
};

/**
 * @param {String} seed A string to seed the generator.
 * @constructor
 */
function RC4(seed) {
    this.s = new Array(256);
    this.i = 0;
    this.j = 0;
    for (var i = 0; i < 256; i++) {
        this.s[i] = i;
    }
    if (seed) {
        this.mix(seed);
    }
}

RC4.prototype._swap = function(i, j) {
    var tmp = this.s[i];
    this.s[i] = this.s[j];
    this.s[j] = tmp;
};

/**
 * Mix additional entropy into this generator.
 * @param {String} seed
 */
RC4.prototype.mix = function(seed) {
    var input = seed.getBytes();
    var j = 0;
    for (var i = 0; i < this.s.length; i++) {
        j += this.s[i] + input[i % input.length];
        j %= 256;
        this._swap(i, j);
    }
};

/**
 * @return {number} The next byte of output from the generator.
 */
RC4.prototype.next = function() {
    this.i = (this.i + 1) % 256;
    this.j = (this.j + this.s[this.i]) % 256;
    this._swap(this.i, this.j);
    return this.s[(this.s[this.i] + this.s[this.j]) % 256];
};

function print_call_stack() {
  var e = new Error();
  var stack = e.stack;
  console.log( stack );
}
/**
 * Create a new random number generator with optional seed. If the
 * provided seed is a function (i.e. Math.random) it will be used as
 * the uniform number generator.
 * @param seed An arbitrary object used to seed the generator.
 * @constructor
 */
function RNG(seed) {
    this.seed = seed;
    if (seed == null) {
        seed = (Math.random() + Date.now()).toString();
        //window.console.log("setting random seed "+seed); 
        //print_call_stack();  

    } else if (typeof seed === 'function') {
        // Use it as a uniform number generator
        this.uniform = seed;
        this.nextByte = function() {
            return ~~(this.uniform() * 256);
        };
        seed = null;
    } else if (Object.prototype.toString.call(seed) !== '[object String]') {
        seed = JSON.stringify(seed);
    } else {
        //window.console.log("setting seed "+seed);
        //print_call_stack();
    }
    this._normal = null;
    if (seed) {
        this._state = new RC4(seed);
    } else {
        this._state = null;
    }
}

/**
 * @return {number} Uniform random number between 0 and 255.
 */
RNG.prototype.nextByte = function() {
    return this._state.next();
};

/**
 * @return {number} Uniform random number between 0 and 1.
 */
RNG.prototype.uniform = function() {
    var BYTES = 7; // 56 bits to make a 53-bit double
    var output = 0;
    for (var i = 0; i < BYTES; i++) {
        output *= 256;
        output += this.nextByte();
    }
    return output / (Math.pow(2, BYTES * 8) - 1);
};

/**
 * Produce a random integer within [n, m).
 * @param {number} [n=0]
 * @param {number} m
 *
 */
RNG.prototype.random = function(n, m) {
    if (n == null) {
        return this.uniform();
    } else if (m == null) {
        m = n;
        n = 0;
    }
    return n + Math.floor(this.uniform() * (m - n));
};

/**
 * Generates numbers using this.uniform() with the Box-Muller transform.
 * @return {number} Normally-distributed random number of mean 0, variance 1.
 */
RNG.prototype.normal = function() {
    if (this._normal !== null) {
        var n = this._normal;
        this._normal = null;
        return n;
    } else {
        var x = this.uniform() || Math.pow(2, -53); // can't be exactly 0
        var y = this.uniform();
        this._normal = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
        return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
    }
};

/**
 * Generates numbers using this.uniform().
 * @return {number} Number from the exponential distribution, lambda = 1.
 */
RNG.prototype.exponential = function() {
    return -Math.log(this.uniform() || Math.pow(2, -53));
};

/**
 * Generates numbers using this.uniform() and Knuth's method.
 * @param {number} [mean=1]
 * @return {number} Number from the Poisson distribution.
 */
RNG.prototype.poisson = function(mean) {
    var L = Math.exp(-(mean || 1));
    var k = 0, p = 1;
    do {
        k++;
        p *= this.uniform();
    } while (p > L);
    return k - 1;
};

/**
 * Generates numbers using this.uniform(), this.normal(),
 * this.exponential(), and the Marsaglia-Tsang method.
 * @param {number} a
 * @return {number} Number from the gamma distribution.
 */
RNG.prototype.gamma = function(a) {
    var d = (a < 1 ? 1 + a : a) - 1 / 3;
    var c = 1 / Math.sqrt(9 * d);
    do {
        do {
            var x = this.normal();
            var v = Math.pow(c * x + 1, 3);
        } while (v <= 0);
        var u = this.uniform();
        var x2 = Math.pow(x, 2);
    } while (u >= 1 - 0.0331 * x2 * x2 &&
             Math.log(u) >= 0.5 * x2 + d * (1 - v + Math.log(v)));
    if (a < 1) {
        return d * v * Math.exp(this.exponential() / -a);
    } else {
        return d * v;
    }
};

/**
 * Accepts a dice rolling notation string and returns a generator
 * function for that distribution. The parser is quite flexible.
 * @param {string} expr A dice-rolling, expression i.e. '2d6+10'.
 * @param {RNG} rng An optional RNG object.
 * @return {Function}
 */
RNG.roller = function(expr, rng) {
    var parts = expr.split(/(\d+)?d(\d+)([+-]\d+)?/).slice(1);
    var dice = parseFloat(parts[0]) || 1;
    var sides = parseFloat(parts[1]);
    var mod = parseFloat(parts[2]) || 0;
    rng = rng || new RNG();
    return function() {
        var total = dice + mod;
        for (var i = 0; i < dice; i++) {
            total += rng.random(sides);
        }
        return total;
    };
};

function isColor(str) {
    str = str.trim();
    if (str in colorPalettes.arnecolors)
        return true;
    if (/^#([0-9A-F]{3}){1,2}$/i.test(str))
        return true;
    if (str === "transparent")
        return true;
    return false;
}

function colorToHex(palette, str) {
    str = str.trim();
    if (str in palette) {
        return palette[str];
    }

    return str;
}


function generateSpriteMatrix(dat) {

    var result = [];
    for (var i = 0; i < dat.length; i++) {
        var row = [];
        for (var j = 0; j < dat.length; j++) {
            var ch = dat[i].charAt(j);
            if (ch == '.') {
                row.push(-1);
            } else {
                row.push(ch);
            }
        }
        result.push(row);
    }
    return result;
}

var debugMode;
var colorPalette;

function generateExtraMembers(state) {

    if (state.collisionLayers.length === 0) {
        logError("No collision layers defined.  All objects need to be in collision layers.");
    }

    //annotate objects with layers
    //assign ids at the same time
    state.idDict = [];
    var idcount = 0;
    for (var layerIndex = 0; layerIndex < state.collisionLayers.length; layerIndex++) {
        for (var j = 0; j < state.collisionLayers[layerIndex].length; j++) {
            var n = state.collisionLayers[layerIndex][j];
            if (n in state.objects) {
                var o = state.objects[n];
                o.layer = layerIndex;
                o.id = idcount;
                state.idDict[idcount] = n;
                idcount++;
            }
        }
    }

    //set object count
    state.objectCount = idcount;

    //calculate blank mask template
    var layerCount = state.collisionLayers.length;
    var blankMask = [];
    for (var i = 0; i < layerCount; i++) {
        blankMask.push(-1);
    }

    // how many words do our bitvecs need to hold?
    STRIDE_OBJ = Math.ceil(state.objectCount / 32) | 0;
    STRIDE_MOV = Math.ceil(layerCount / 5) | 0;
    state.STRIDE_OBJ = STRIDE_OBJ;
    state.STRIDE_MOV = STRIDE_MOV;

    //get colorpalette name
    debugMode = false;
    verbose_logging = false;
    throttle_movement = false;
    colorPalette = colorPalettes.arnecolors;
    for (var i = 0; i < state.metadata.length; i += 2) {
        var key = state.metadata[i];
        var val = state.metadata[i + 1];
        if (key === 'color_palette') {
            if (val in colorPalettesAliases) {
                val = colorPalettesAliases[val];
            }
            if (colorPalettes[val] === undefined) {
                logError('Palette "' + val + '" not found, defaulting to arnecolors.', 0);
            } else {
                colorPalette = colorPalettes[val];
            }
        } else if (key === 'debug') {
            if (IDE && unitTesting===false){
                debugMode = true;
                cache_console_messages = true;
            }
        } else if (key === 'verbose_logging') {
            if (IDE && unitTesting===false){
                verbose_logging = true;
                cache_console_messages = true;
            }
        } else if (key === 'throttle_movement') {
            throttle_movement = true;
        }
    }

    //convert colors to hex
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            //convert color to hex
            var o = state.objects[n];
            if (o.colors.length > 10) {
                logError("a sprite cannot have more than 10 colors.  Why you would want more than 10 is beyond me.", o.lineNumber + 1);
            }
            for (var i = 0; i < o.colors.length; i++) {
                var c = o.colors[i];
                if (isColor(c)) {
                    c = colorToHex(colorPalette, c);
                    o.colors[i] = c;
                } else {
                    logError('Invalid color specified for object "' + n + '", namely "' + o.colors[i] + '".', o.lineNumber + 1);
                    o.colors[i] = '#ff00ff'; // magenta error color
                }
            }
        }
    }

    //generate sprite matrix
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var o = state.objects[n];
            if (o.colors.length == 0) {
                logError('color not specified for object "' + n + '".', o.lineNumber);
                o.colors = ["#ff00ff"];
            }
            if (o.spritematrix.length === 0) {
                o.spritematrix = [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0]
                ];
            } else {
                if (o.spritematrix.length !== 5 || o.spritematrix[0].length !== 5 || o.spritematrix[1].length !== 5 || o.spritematrix[2].length !== 5 || o.spritematrix[3].length !== 5 || o.spritematrix[4].length !== 5) {
                    logWarning("Sprite graphics must be 5 wide and 5 high exactly.", o.lineNumber);
                }
                o.spritematrix = generateSpriteMatrix(o.spritematrix);
            }
        }
    }

    var glyphOrder = [];
    //calculate glyph dictionary
    var glyphDict = {};
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var o = state.objects[n];
            var mask = blankMask.concat([]);
            mask[o.layer] = o.id;
            glyphDict[n] = mask;
            glyphOrder.push([o.lineNumber,n]);
        }
    }
    
    var added = true;
    while (added) 
    {
        added = false;

        //then, synonyms
        for (var i = 0; i < state.legend_synonyms.length; i++) {
            var dat = state.legend_synonyms[i];
            var key = dat[0];
            var val = dat[1];
            if ((!(key in glyphDict) || (glyphDict[key] === undefined)) && (glyphDict[val] !== undefined)) {
                added = true;
                glyphDict[key] = glyphDict[val];
                glyphOrder.push([dat.lineNumber,key]);
            } 
        }

        //then, aggregates
        for (var i = 0; i < state.legend_aggregates.length; i++) {
            var dat = state.legend_aggregates[i];
            var key = dat[0];
            var vals = dat.slice(1);
            var allVallsFound = true;
            for (var j = 0; j < vals.length; j++) {
                var v = vals[j];
                if (glyphDict[v] === undefined) {
                    allVallsFound = false;
                    break;
                }
            }
            if ((!(key in glyphDict) || (glyphDict[key] === undefined)) && allVallsFound) {
                var mask = blankMask.concat([]);

                for (var j = 1; j < dat.length; j++) {
                    var n = dat[j];
                    var o = state.objects[n];
                    if (o == undefined) {
                        logError('Object not found with name ' + n, state.lineNumber);
                    }
                    if (mask[o.layer] == -1) {
                        mask[o.layer] = o.id;
                    } else {
                        if (o.layer === undefined) {
                            logError('Object "' + n.toUpperCase() + '" has been defined, but not assigned to a layer.', dat.lineNumber);
                        } else {
                            var n1 = n.toUpperCase();
                            var n2 = state.idDict[mask[o.layer]].toUpperCase();
                            // if (n1 !== n2) {
                                logError(
                                    'Trying to create an aggregate object (something defined in the LEGEND section using AND) with both "' +
                                    n1 + '" and "' + n2 + '", which are on the same layer and therefore can\'t coexist.',
                                    dat.lineNumber
                                );
                            // }
                        }
                    }
                }
                added = true;
                glyphDict[dat[0]] = mask;
                glyphOrder.push([dat.lineNumber,key]);
            }
        }
    }
    
    //sort glyphs line number
    glyphOrder.sort((a,b)=>a[0] - b[0]);
    glyphOrder = glyphOrder.map(a=>a[1]);

    state.glyphDict = glyphDict;
    state.glyphOrder = glyphOrder;

    var aggregatesDict = {};
    for (var i = 0; i < state.legend_aggregates.length; i++) {
        var entry = state.legend_aggregates[i];
        aggregatesDict[entry[0]] = entry.slice(1);
    }
    state.aggregatesDict = aggregatesDict;

    var propertiesDict = {};
    for (var i = 0; i < state.legend_properties.length; i++) {
        var entry = state.legend_properties[i];
        propertiesDict[entry[0]] = entry.slice(1);
    }
    state.propertiesDict = propertiesDict;

    //calculate lookup dictionaries
    var synonymsDict = {};
    for (var i = 0; i < state.legend_synonyms.length; i++) {
        var entry = state.legend_synonyms[i];
        var key = entry[0];
        var value = entry[1];
        if (value in aggregatesDict) {
            aggregatesDict[key] = aggregatesDict[value];
        } else if (value in propertiesDict) {
            propertiesDict[key] = propertiesDict[value];
        } else if (key !== value) {
            synonymsDict[key] = value;
        }
    }
    state.synonymsDict = synonymsDict;

    var modified = true;
    while (modified) {
        modified = false;
        for (var n in synonymsDict) {
            if (synonymsDict.hasOwnProperty(n)) {
                var value = synonymsDict[n];
                if (value in propertiesDict) {
                    delete synonymsDict[n];
                    propertiesDict[n] = propertiesDict[value];
                    modified = true;
                } else if (value in aggregatesDict) {
                    delete aggregatesDict[n];
                    aggregatesDict[n] = aggregatesDict[value];
                    modified = true;
                } else if (value in synonymsDict) {
                    synonymsDict[n] = synonymsDict[value];
                }
            }
        }

        for (var n in propertiesDict) {
            if (propertiesDict.hasOwnProperty(n)) {
                var values = propertiesDict[n];
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    if (value in synonymsDict) {
                        values[i] = synonymsDict[value];
                        modified = true;
                    } else if (value in propertiesDict) {
                        values.splice(i, 1);
                        var newvalues = propertiesDict[value];
                        for (var j = 0; j < newvalues.length; j++) {
                            var newvalue = newvalues[j];
                            if (values.indexOf(newvalue) === -1) {
                                values.push(newvalue);
                            }
                        }
                        modified = true;
                    }
                    if (value in aggregatesDict) {
                        logError('Trying to define property "' + n.toUpperCase() + '" in terms of aggregate "' + value.toUpperCase() + '".');
                    }
                }
            }
        }


        for (var n in aggregatesDict) {
            if (aggregatesDict.hasOwnProperty(n)) {
                var values = aggregatesDict[n];
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    if (value in synonymsDict) {
                        values[i] = synonymsDict[value];
                        modified = true;
                    } else if (value in aggregatesDict) {
                        values.splice(i, 1);
                        var newvalues = aggregatesDict[value];
                        for (var j = 0; j < newvalues.length; j++) {
                            var newvalue = newvalues[j];
                            if (values.indexOf(newvalue) === -1) {
                                values.push(newvalue);
                            }
                        }
                        modified = true;
                    }
                    if (value in propertiesDict) {
                        logError('Trying to define aggregate "' + n.toUpperCase() + '" in terms of property "' + value.toUpperCase() + '".');
                    }
                }
            }
        }
    }

    /* determine which properties specify objects all on one layer */
    state.propertiesSingleLayer = {};
    for (var key in propertiesDict) {
        if (propertiesDict.hasOwnProperty(key)) {
            var values = propertiesDict[key];
            var sameLayer = true;
            for (var i = 1; i < values.length; i++) {
                if ((state.objects[values[i - 1]].layer !== state.objects[values[i]].layer)) {
                    sameLayer = false;
                    break;
                }
            }
            if (sameLayer) {
                state.propertiesSingleLayer[key] = state.objects[values[0]].layer;
            }
        }
    }

    if (state.idDict[0] === undefined && state.collisionLayers.length > 0) {
        logError('You need to have some objects defined');
    }

    //set default background object
    var backgroundid;
    var backgroundlayer;
    if (state.objects.background === undefined) {
        if ('background' in state.synonymsDict) {
            var n = state.synonymsDict['background'];
            var o = state.objects[n];
            backgroundid = o.id;
            backgroundlayer = o.layer;
        } else if ('background' in state.propertiesDict) {
            var backgrounddef = state.propertiesDict['background'];
            var n = backgrounddef[0];
            var o = state.objects[n];
            backgroundid = o.id;
            backgroundlayer = o.layer;
            for (var i=1;i<backgrounddef.length;i++){
                var nnew = backgrounddef[i];
                var onew = state.objects[nnew];
                if (onew.layer !== backgroundlayer) {
                    var lineNumber = state.original_line_numbers['background'];
                    logError('Background objects must be on the same layer',lineNumber);
                }
            }
        } else if ('background' in state.aggregatesDict) {
            var o = state.objects[state.idDict[0]];
            backgroundid = o.id;
            backgroundlayer = o.layer;
            var lineNumber = state.original_line_numbers['background'];
            logError("background cannot be an aggregate (declared with 'and'), it has to be a simple type, or property (declared in terms of others using 'or').",lineNumber);
        } else {
            var o = state.objects[state.idDict[0]];
            if (o!=null){
                backgroundid = o.id;
                backgroundlayer = o.layer;
            }
            logError("you have to define something to be the background");
        }
    } else {
        backgroundid = state.objects.background.id;
        backgroundlayer = state.objects.background.layer;
    }
    state.backgroundid = backgroundid;
    state.backgroundlayer = backgroundlayer;
}

Level.prototype.calcBackgroundMask = function(state) {    
    if (state.backgroundlayer === undefined) {
        logError("you have to have a background layer");
    }

    var backgroundMask = state.layerMasks[state.backgroundlayer];
    for (var i = 0; i < this.n_tiles; i++) {
        var cell = this.getCell(i);
        cell.iand(backgroundMask);
        if (!cell.iszero()) {
            return cell;
        }
    }
    cell = new BitVec(STRIDE_OBJ);
    cell.ibitset(state.backgroundid);
    return cell;
}

function levelFromString(state, level) {
    var backgroundlayer = state.backgroundlayer;
    var backgroundid = state.backgroundid;
    var backgroundLayerMask = state.layerMasks[backgroundlayer];
    var o = new Level(level[0], level[1].length, level.length - 1, state.collisionLayers.length, null);
    o.objects = new Int32Array(o.width * o.height * STRIDE_OBJ);

    for (var i = 0; i < o.width; i++) {
        for (var j = 0; j < o.height; j++) {
            var ch = level[j + 1].charAt(i);
            if (ch.length == 0) {
                ch = level[j + 1].charAt(level[j + 1].length - 1);
            }
            var mask = state.glyphDict[ch];

            if (mask == undefined) {
                if (state.propertiesDict[ch] === undefined) {
                    logError('Error, symbol "' + ch + '", used in map, not found.', level[0] + j);
                } else {
                    logError('Error, symbol "' + ch + '" is defined using OR, and therefore ambiguous - it cannot be used in a map. Did you mean to define it in terms of AND?', level[0] + j);
                }
                return o;
            }

            var maskint = new BitVec(STRIDE_OBJ);
            mask = mask.concat([]);
            for (var z = 0; z < o.layerCount; z++) {
                if (mask[z] >= 0) {
                    maskint.ibitset(mask[z]);
                }
            }
            for (var w = 0; w < STRIDE_OBJ; ++w) {
                o.objects[STRIDE_OBJ * (i * o.height + j) + w] = maskint.data[w];
            }
        }
    }

    var levelBackgroundMask = o.calcBackgroundMask(state);
    for (var i = 0; i < o.n_tiles; i++) {
        var cell = o.getCell(i);
        if (!backgroundLayerMask.anyBitsInCommon(cell)) {
            cell.ior(levelBackgroundMask);
            o.setCell(i, cell);
        }
    }
    return o;
}
//also assigns glyphDict
function levelsToArray(state) {
    var levels = state.levels;
    var processedLevels = [];

    for (var levelIndex = 0; levelIndex < levels.length; levelIndex++) {
        var level = levels[levelIndex];
        if (level.length == 0) {
            continue;
        }
        if (level[0] == '\n') {

            var o = {
                message: level[1]
            };
            splitMessage = wordwrap(o.message, intro_template[0].length);
            if (splitMessage.length > 12) {
                logWarning('Message too long to fit on screen.', level[2]);
            }

            processedLevels.push(o);
        } else {
            var o = levelFromString(state, level);
            processedLevels.push(o);
        }

    }

    state.levels = processedLevels;
}

var directionaggregates = {
    'horizontal': ['left', 'right'],
    'horizontal_par': ['left', 'right'],
    'horizontal_perp': ['left', 'right'],
    'vertical': ['up', 'down'],
    'vertical_par': ['up', 'down'],
    'vertical_perp': ['up', 'down'],
    'moving': ['up', 'down', 'left', 'right', 'action'],
    'orthogonal': ['up', 'down', 'left', 'right'],
    'perpendicular': ['^', 'v'],
    'parallel': ['<', '>']
};

var relativeDirections = ['^', 'v', '<', '>', 'perpendicular', 'parallel'];
var simpleAbsoluteDirections = ['up', 'down', 'left', 'right'];
var simpleRelativeDirections = ['^', 'v', '<', '>'];
var reg_directions_only = /^(\>|\<|\^|v|up|down|left|right|moving|stationary|no|randomdir|random|horizontal|vertical|orthogonal|perpendicular|parallel|action)$/;
//redeclaring here, i don't know why
var commandwords = ["sfx0", "sfx1", "sfx2", "sfx3", "sfx4", "sfx5", "sfx6", "sfx7", "sfx8", "sfx9", "sfx10", "cancel", "checkpoint", "restart", "win", "message", "again"];


function directionalRule(rule) {
    for (var i = 0; i < rule.lhs.length; i++) {
        var cellRow = rule.lhs[i];
        if (cellRow.length > 1) {
            return true;
        }
        for (var j = 0; j < cellRow.length; j++) {
            var cell = cellRow[j];
            for (var k = 0; k < cell.length; k += 2) {
                if (relativeDirections.indexOf(cell[k]) >= 0) {
                    return true;
                }
            }
        }
    }
    for (var i = 0; i < rule.rhs.length; i++) {
        var cellRow = rule.rhs[i];
        for (var j = 0; j < cellRow.length; j++) {
            var cell = cellRow[j];
            for (var k = 0; k < cell.length; k += 2) {
                if (relativeDirections.indexOf(cell[k]) >= 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function findIndexAfterToken(str, tokens, tokenIndex) {
    str = str.toLowerCase();
    var curIndex = 0;
    for (var i = 0; i <= tokenIndex; i++) {
        var token = tokens[i];
        curIndex = str.indexOf(token, curIndex) + token.length;
    }
    return curIndex;
}
function rightBracketToRightOf(tokens,i){
    for(;i<tokens.length;i++){
        if (tokens[i]==="]"){
            return true;
        }
    }
    return false;
}

function processRuleString(rule, state, curRules) {
    /*

    	intermediate structure
    		dirs: Directions[]
    		pre : CellMask[]
    		post : CellMask[]

    		//pre/post pairs must have same lengths
    	final rule structure
    		dir: Direction
    		pre : CellMask[]
    		post : CellMask[]
    */
    var line = rule[0];
    var lineNumber = rule[1];
    var origLine = rule[2];

    // STEP ONE, TOKENIZE
    line = line.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ').replace(/\|/g, ' | ').replace(/\-\>/g, ' -> ');
    line = line.trim();
    if (line[0] === '+') {
        line = line.substring(0, 1) + " " + line.substring(1, line.length);
    }
    var tokens = line.split(/\s/).filter(function(v) { return v !== '' });

    if (tokens.length == 0) {
        logError('Spooky error!  Empty line passed to rule function.', lineNumber);
    }


    // STEP TWO, READ DIRECTIONS
    /*
    	STATE
    	0 - scanning for initial directions
    	LHS
    	1 - reading cell contents LHS
    	2 - reading cell contents RHS
    */
    var parsestate = 0;
    var directions = [];

    var curcell = null; // [up, cat, down mouse]
    var curcellrow = []; // [  [up, cat]  [ down, mouse ] ]

    var incellrow = false;

    var appendGroup = false;
    var rhs = false;
    var lhs_cells = [];
    var rhs_cells = [];
    var late = false;
    var rigid = false;
    var groupNumber = lineNumber;
    var commands = [];
    var randomRule = false;
	var has_plus = false;

    if (tokens.length === 1) {
        if (tokens[0] === "startloop") {
            rule_line = {
                bracket: 1
            }
            return rule_line;
        } else if (tokens[0] === "endloop") {
            rule_line = {
                bracket: -1
            }
            return rule_line;
        }
    }

    if (tokens.indexOf('->') == -1) {
        logError("A rule has to have an arrow in it.  There's no arrow here! Consider reading up about rules - you're clearly doing something weird", lineNumber);
    }

    var curcell = [];
    var bracketbalance = 0;
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        switch (parsestate) {
            case 0:
                {
                    //read initial directions
                    if (token === '+') {
                        has_plus=true;
                        if (groupNumber === lineNumber) {
                            if (curRules.length == 0) {
                                logError('The "+" symbol, for joining a rule with the group of the previous rule, needs a previous rule to be applied to.', lineNumber);
                            }
                            if (i !== 0) {
                                logError('The "+" symbol, for joining a rule with the group of the previous rule, must be the first symbol on the line ', lineNumber);
                            }
                            groupNumber = curRules[curRules.length - 1].groupNumber;
                        } else {
                            logError('Two "+"s (the "append to previous rule group" symbol) applied to the same rule.', lineNumber);
                        }
                    } else if (token in directionaggregates) {
                        directions = directions.concat(directionaggregates[token]);
                    } else if (token === 'late') {
                        late = true;                        
                    } else if (token === 'rigid') {
                        rigid = true;
                    } else if (token === 'random') {
                        randomRule = true;
                        if (has_plus)
                        {
                            logError(`A rule-group can only be marked random by the opening rule in the group (aka, a '+' and 'random' can't appear as rule modifiers on the same line).  Why? Well, you see "random" isn't a property of individual rules, but of whole rule groups.  It indicates that a single possible application of some rule from the whole group should be applied at random.`, lineNumber) 
                        }

                    } else if (simpleAbsoluteDirections.indexOf(token) >= 0) {
                        directions.push(token);
                    } else if (simpleRelativeDirections.indexOf(token) >= 0) {
                        logError('You cannot use relative directions (\"^v<>\") to indicate in which direction(s) a rule applies.  Use absolute directions indicators (Up, Down, Left, Right, Horizontal, or Vertical, for instance), or, if you want the rule to apply in all four directions, do not specify directions', lineNumber);
                    } else if (token == '[') {
                        if (directions.length == 0) {
                            directions = directions.concat(directionaggregates['orthogonal']);
                        }
                        parsestate = 1;
                        i--;
                    } else {
                        logError("The start of a rule must consist of some number of directions (possibly 0), before the first bracket, specifying in what directions to look (with no direction specified, it applies in all four directions).  It seems you've just entered \"" + token.toUpperCase() + '\".', lineNumber);
                    }
                    break;
                }
            case 1:
                {                                        
                    if (token == '[') {
                        bracketbalance++;
                        if (bracketbalance > 1) {
                            logWarning("Multiple opening brackets without closing brackets.  Something fishy here.  Every '[' has to be closed by a ']', and you can't nest them.", lineNumber);
                        }
                        if (curcell.length > 0) {
                            logError('Error, malformed cell rule - encountered a "["" before previous bracket was closed', lineNumber);
                        }
                        incellrow = true;
                        curcell = [];
                    } else if (reg_directions_only.exec(token)) {
                        if (curcell.length % 2 == 1) {
                            logError("Error, an item can only have one direction/action at a time, but you're looking for several at once!", lineNumber);
                        } else if (!incellrow) {
                            logWarning("Invalid syntax. Directions should be placed at the start of a rule.", lineNumber);
                        } else if (late && token!=='no' && token!=='random' && token!=='randomdir') {
                            logError("Movements cannot appear in late rules.", lineNumber);
                        } else {
                            curcell.push(token);
                        }
                    } else if (token == '|') {
                        if (!incellrow) {
                            logWarning('Janky syntax.  "|" should only be used inside cell rows (the square brackety bits).', lineNumber);
                        } else if (curcell.length % 2 == 1) {
                            logError('In a rule, if you specify a movement, it has to act on an object.', lineNumber);
                        } else {
                            curcellrow.push(curcell);
                            curcell = [];
                        }
                    } else if (token === ']') {

                        bracketbalance--;
                        if (bracketbalance < 0) {
                            logWarning("Multiple closing brackets without corresponding opening brackets.  Something fishy here.  Every '[' has to be closed by a ']', and you can't nest them.", lineNumber);
                        }

                        if (curcell.length % 2 == 1) {
                            if (curcell[0] === '...') {
                                logError('Cannot end a rule with ellipses.', lineNumber);
                            } else {
                                logError('In a rule, if you specify a movement, it has to act on an object.', lineNumber);
                            }
                        } else {
                            curcellrow.push(curcell);
                            curcell = [];
                        }

                        if (rhs) {
                            rhs_cells.push(curcellrow);
                        } else {
                            lhs_cells.push(curcellrow);
                        }
                        curcellrow = [];
                        incellrow = false;
                    } else if (token === '->') {

                        if (groupNumber !== lineNumber) {
                            var parentrule = curRules[curRules.length - 1];
                            if (parentrule.late!==late){
                                logWarning('Oh gosh you can mix late and non-late rules in a rule-group if you really want to, but gosh why would you want to do that?  What do you expect to accomplish?', lineNumber);
                            }
                        }
                        
                        if (incellrow) {
                            logWarning('Encountered an unexpected "->" inside square brackets.  It\'s used to separate states, it has no place inside them >:| .', lineNumber);
                        } else if (rhs) {
                            logError('Error, you can only use "->" once in a rule; it\'s used to separate before and after states.', lineNumber);
                        } else {
                            rhs = true;
                        }
                    } else if (state.names.indexOf(token) >= 0) {
                        if (!incellrow) {
                            logWarning("Invalid token " + token.toUpperCase() + ". Object names should only be used within cells (square brackets).", lineNumber);
                        } else if (curcell.length % 2 == 0) {
                            curcell.push('');
                            curcell.push(token);
                        } else if (curcell.length % 2 == 1) {
                            curcell.push(token);
                        }
                    } else if (token === '...') {
                        if (!incellrow) {
                            logWarning("Invalid syntax, ellipses should only be used within cells (square brackets).", lineNumber);
                        } else {
                            curcell.push(token);
                            curcell.push(token);
                        }
                    } else if (commandwords.indexOf(token) >= 0) {
                        if (rhs === false) {
                            logError("Commands should only appear at the end of rules, not in or before the pattern-detection/-replacement sections.", lineNumber);
                        } else if (incellrow || rightBracketToRightOf(tokens,i)){//only a warning for legacy support reasons.
                            logWarning("Commands should only appear at the end of rules, not in or before the pattern-detection/-replacement sections.", lineNumber);
                        }
                        if (token === 'message') {
                            var messageIndex = findIndexAfterToken(origLine, tokens, i);
                            var messageStr = origLine.substring(messageIndex).trim();
                            if (messageStr === "") {
                                messageStr = " ";
                                //needs to be nonempty or the system gets confused and thinks it's a whole level message rather than an interstitial.
                            }
                            commands.push([token, messageStr]);
                            i = tokens.length;
                        } else {
                            commands.push([token]);
                        }
                    } else {
                        logError('Error, malformed cell rule - was looking for cell contents, but found "' + token + '".  What am I supposed to do with this, eh, please tell me that.', lineNumber);
                    }
                }

        }
    }

    if (late && rigid){
        logError("Late rules cannot be marked as rigid (rigid rules are all about dealing with the consequences of unresolvable movements, and late rules can't even have movements).", lineNumber);
    }
    
    if (lhs_cells.length != rhs_cells.length) {
        if (commands.length > 0 && rhs_cells.length == 0) {
            //ok
        } else {
            logWarning('Error, when specifying a rule, the number of matches (square bracketed bits) on the left hand side of the arrow must equal the number on the right', lineNumber);
        }
    } else {
        for (var i = 0; i < lhs_cells.length; i++) {
            if (lhs_cells[i].length != rhs_cells[i].length) {
                logError('In a rule, each pattern to match on the left must have a corresponding pattern on the right of equal length (number of cells).', lineNumber);
                state.invalid=true;
            }
            if (lhs_cells[i].length == 0) {
                logError("You have an totally empty pattern on the left-hand side.  This will match *everything*.  You certainly don't want this.");
            }
        }
    }

    if (lhs_cells.length == 0) {
        logError('This rule refers to nothing.  What the heck? :O', lineNumber);
    }

    var rule_line = {
        directions: directions,
        lhs: lhs_cells,
        rhs: rhs_cells,
        lineNumber: lineNumber,
        late: late,
        rigid: rigid,
        groupNumber: groupNumber,
        commands: commands,
        randomRule: randomRule
    };

    if (directionalRule(rule_line) === false && rule_line.directions.length>1) {
        rule_line.directions.splice(1);
    }

    //next up - replace relative directions with absolute direction

    return rule_line;
}

function deepCloneHS(HS) {
    var cloneHS = HS.map(function(arr) { return arr.map(function(deepArr) { return deepArr.slice(); }); });
    return cloneHS;
}

function deepCloneRule(rule) {
    var clonedRule = {
        direction: rule.direction,
        lhs: deepCloneHS(rule.lhs),
        rhs: deepCloneHS(rule.rhs),
        lineNumber: rule.lineNumber,
        late: rule.late,
        rigid: rule.rigid,
        groupNumber: rule.groupNumber,
        commands: rule.commands,
        randomRule: rule.randomRule
    };
    return clonedRule;
}

function rulesToArray(state) {
    var oldrules = state.rules;
    var rules = [];
    var loops = [];
    for (var i = 0; i < oldrules.length; i++) {
        var lineNumber = oldrules[i][1];
        var newrule = processRuleString(oldrules[i], state, rules);
        if (newrule.bracket !== undefined) {
            loops.push([lineNumber, newrule.bracket]);
            continue;
        }
        rules.push(newrule);
    }
    state.loops = loops;

    //now expand out rules with multiple directions
    var rules2 = [];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var ruledirs = rule.directions;
        for (var j = 0; j < ruledirs.length; j++) {
            var dir = ruledirs[j];
            // The following block is never getting hit by any tests. 
            // Presumably in the past it was used to expand out rules with
            // multiple directions, but now that's done somewhere else.
            if (dir in directionaggregates && directionalRule(rule)) {
                var dirs = directionaggregates[dir];
                for (var k = 0; k < dirs.length; k++) {
                    var modifiedrule = deepCloneRule(rule);
                    modifiedrule.direction = dirs[k];
                    rules2.push(modifiedrule);
                }
            } else {
                var modifiedrule = deepCloneRule(rule);
                modifiedrule.direction = dir;
                rules2.push(modifiedrule);
            }
        }
    }

    for (var i = 0; i < rules2.length; i++) {
        var rule = rules2[i];
        //remove relative directions
        convertRelativeDirsToAbsolute(rule);
        //optional: replace up/left rules with their down/right equivalents
        rewriteUpLeftRules(rule);
        //replace aggregates with what they mean
        atomizeAggregates(state, rule);

        if (state.invalid){
            return;
        }
        
        //replace synonyms with what they mean
        rephraseSynonyms(state, rule);
    }

    var rules3 = [];
    //expand property rules
    for (var i = 0; i < rules2.length; i++) {
        var rule = rules2[i];
        rules3 = rules3.concat(concretizeMovingRule(state, rule, rule.lineNumber));
    }

    var rules4 = [];
    for (var i = 0; i < rules3.length; i++) {
        var rule = rules3[i];
        rules4 = rules4.concat(concretizePropertyRule(state, rule, rule.lineNumber));

    }

    for (var i=0;i<rules4.length;i++){
        makeSpawnedObjectsStationary(state,rules4[i],rule.lineNumber);
    }
    state.rules = rules4;
}

function containsEllipsis(rule) {
    for (var i = 0; i < rule.lhs.length; i++) {
        for (var j = 0; j < rule.lhs[i].length; j++) {
            if (rule.lhs[i][j][1] === '...')
                return true;
        }
    }
    return false;
}

function rewriteUpLeftRules(rule) {
    if (containsEllipsis(rule)) {
        return;
    }

    if (rule.direction == 'up') {
        rule.direction = 'down';
    } else if (rule.direction == 'left') {
        rule.direction = 'right';
    } else {
        return;
    }

    for (var i = 0; i < rule.lhs.length; i++) {
        rule.lhs[i].reverse();
        if (rule.rhs.length > 0) {
            rule.rhs[i].reverse();
        }
    }
}

//expands all properties to list of all things it could be, filterio
function getPossibleObjectsFromCell(state, cell) {
    var result = [];
    for (var j = 0; j < cell.length; j += 2) {
        var dir = cell[j];
        var name = cell[j + 1];
        if (name in state.objects){
            result.push(name);
        }
        else if (name in state.propertiesDict) {
            var aliases = state.propertiesDict[name];
            for (var k = 0; k < aliases.length; k++) {
                var alias = aliases[k];
                result.push(alias);
            }        
        }
    }
    return result;
}

function getPropertiesFromCell(state, cell) {
    var result = [];
    for (var j = 0; j < cell.length; j += 2) {
        var dir = cell[j];
        var name = cell[j + 1];
        if (dir == "random") {
            continue;
        }
        if (name in state.propertiesDict) {
            result.push(name);
        }
    }
    return result;
}

//returns you a list of object names in that cell that're moving
function getMovings(state, cell) {
    var result = [];
    for (var j = 0; j < cell.length; j += 2) {
        var dir = cell[j];
        var name = cell[j + 1];
        if (dir in directionaggregates) {
            result.push([name, dir]);
        }
    }
    return result;
}

function concretizePropertyInCell(cell, property, concreteType) {
    for (var j = 0; j < cell.length; j += 2) {
        if (cell[j + 1] === property && cell[j] !== "random") {
            cell[j + 1] = concreteType;
        }
    }
}

function concretizeMovingInCell(cell, ambiguousMovement, nameToMove, concreteDirection) {
    for (var j = 0; j < cell.length; j += 2) {
        if (cell[j] === ambiguousMovement && cell[j + 1] === nameToMove) {
            cell[j] = concreteDirection;
        }
    }
}

function concretizeMovingInCellByAmbiguousMovementName(cell, ambiguousMovement, concreteDirection) {
    for (var j = 0; j < cell.length; j += 2) {
        if (cell[j] === ambiguousMovement) {
            cell[j] = concreteDirection;
        }
    }
}

function expandNoPrefixedProperties(state, cell) {
    var expanded = [];
    for (var i = 0; i < cell.length; i += 2) {
        var dir = cell[i];
        var name = cell[i + 1];

        if (dir === 'no' && (name in state.propertiesDict)) {
            var aliases = state.propertiesDict[name];
            for (var j = 0; j < aliases.length; j++) {
                var alias = aliases[j];
                expanded.push(dir);
                expanded.push(alias);
            }
        } else {
            expanded.push(dir);
            expanded.push(name);
        }
    }
    return expanded;
}

function concretizePropertyRule(state, rule, lineNumber) {

    //step 1, rephrase rule to change "no flying" to "no cat no bat"
    for (var i = 0; i < rule.lhs.length; i++) {
        var cur_cellrow_l = rule.lhs[i];
        for (var j = 0; j < cur_cellrow_l.length; j++) {
            cur_cellrow_l[j] = expandNoPrefixedProperties(state, cur_cellrow_l[j]);
            if (rule.rhs.length > 0)
                rule.rhs[i][j] = expandNoPrefixedProperties(state, rule.rhs[i][j]);
        }
    }

    //are there any properties we could avoid processing?
    // e.g. [> player | movable] -> [> player | > movable],
    // 		doesn't need to be split up (assuming single-layer player/block aggregates)

    // we can't manage this if they're being used to disambiguate
    var ambiguousProperties = {};

    for (var j = 0; j < rule.rhs.length; j++) {
        var row_l = rule.lhs[j];
        var row_r = rule.rhs[j];
        for (var k = 0; k < row_r.length; k++) {
            var properties_l = getPropertiesFromCell(state, row_l[k]);
            var properties_r = getPropertiesFromCell(state, row_r[k]);
            for (var prop_n = 0; prop_n < properties_r.length; prop_n++) {
                var property = properties_r[prop_n];
                if (properties_l.indexOf(property) == -1) {
                    ambiguousProperties[property] = true;
                }
            }
        }
    }

    var shouldremove;
    var result = [rule];
    var modified = true;
    while (modified) {
        modified = false;
        for (var i = 0; i < result.length; i++) {
            //only need to iterate through lhs
            var cur_rule = result[i];
            shouldremove = false;
            for (var j = 0; j < cur_rule.lhs.length && !shouldremove; j++) {
                var cur_rulerow = cur_rule.lhs[j];
                for (var k = 0; k < cur_rulerow.length && !shouldremove; k++) {
                    var cur_cell = cur_rulerow[k];
                    var properties = getPropertiesFromCell(state, cur_cell);
                    for (var prop_n = 0; prop_n < properties.length; ++prop_n) {
                        var property = properties[prop_n];

                        if (state.propertiesSingleLayer.hasOwnProperty(property) &&
                            ambiguousProperties[property] !== true) {
                            // we don't need to explode this property
                            continue;
                        }

                        var aliases = state.propertiesDict[property];

                        shouldremove = true;
                        modified = true;

                        //just do the base property, let future iterations take care of the others

                        for (var l = 0; l < aliases.length; l++) {
                            var concreteType = aliases[l];
                            var newrule = deepCloneRule(cur_rule);
                            newrule.propertyReplacement = {};
                            for (var prop in cur_rule.propertyReplacement) {
                                if (cur_rule.propertyReplacement.hasOwnProperty(prop)) {
                                    var propDat = cur_rule.propertyReplacement[prop];
                                    newrule.propertyReplacement[prop] = [propDat[0], propDat[1]];
                                }
                            }

                            concretizePropertyInCell(newrule.lhs[j][k], property, concreteType);
                            if (newrule.rhs.length > 0) {
                                concretizePropertyInCell(newrule.rhs[j][k], property, concreteType); //do for the corresponding rhs cell as well
                            }

                            if (newrule.propertyReplacement[property] === undefined) {
                                newrule.propertyReplacement[property] = [concreteType, 1];
                            } else {
                                newrule.propertyReplacement[property][1] = newrule.propertyReplacement[property][1] + 1;
                            }

                            result.push(newrule);
                        }

                        break;
                    }
                }
            }
            if (shouldremove) {
                result.splice(i, 1);
                i--;
            }
        }
    }


    for (var i = 0; i < result.length; i++) {
        //for each rule
        var cur_rule = result[i];
        if (cur_rule.propertyReplacement === undefined) {
            continue;
        }

        //for each property replacement in that rule
        for (var property in cur_rule.propertyReplacement) {
            if (cur_rule.propertyReplacement.hasOwnProperty(property)) {
                var replacementInfo = cur_rule.propertyReplacement[property];
                var concreteType = replacementInfo[0];
                var occurrenceCount = replacementInfo[1];
                if (occurrenceCount === 1) {
                    //do the replacement
                    for (var j = 0; j < cur_rule.rhs.length; j++) {
                        var cellRow_rhs = cur_rule.rhs[j];
                        for (var k = 0; k < cellRow_rhs.length; k++) {
                            var cell = cellRow_rhs[k];
                            concretizePropertyInCell(cell, property, concreteType);
                        }
                    }
                }
            }
        }
    }

    //if any properties remain on the RHSes, bleep loudly
    var rhsPropertyRemains = '';
    for (var i = 0; i < result.length; i++) {
        var cur_rule = result[i];
        delete result.propertyReplacement;
        for (var j = 0; j < cur_rule.rhs.length; j++) {
            var cur_rulerow = cur_rule.rhs[j];
            for (var k = 0; k < cur_rulerow.length; k++) {
                var cur_cell = cur_rulerow[k];
                var properties = getPropertiesFromCell(state, cur_cell);
                for (var prop_n = 0; prop_n < properties.length; prop_n++) {
                    if (ambiguousProperties.hasOwnProperty(properties[prop_n])) {
                        rhsPropertyRemains = properties[prop_n];
                    }
                }
            }
        }
    }


    if (rhsPropertyRemains.length > 0) {
        logError('This rule has a property on the right-hand side, \"' + rhsPropertyRemains.toUpperCase() + "\", that can't be inferred from the left-hand side.  (either for every property on the right there has to be a corresponding one on the left in the same cell, OR, if there's a single occurrence of a particular property name on the left, all properties of the same name on the right are assumed to be the same).", lineNumber);
        return [];
    }

    return result;
}

function makeSpawnedObjectsStationary(state,rule,lineNumber){
    //movement not getting correctly cleared from tile #492
    //[ > Player | ] -> [ Crate | Player ] if there was a player already in the second cell, it's not replaced with a stationary player.
    //if there are properties remaining by this stage, just ignore them ( c.f. "[ >  Moveable | Moveable ] -> [ > Moveable | > Moveable ]" in block faker, what's left in this form) - this only happens IIRC when the properties span a single layer so it's)
    //if am object without moving-annotations appears on the RHS, and that object is not present on the lhs (either explicitly as an object, or implicitly in a property), add a 'stationary'
    if (rule.late){
        return;
    }

    for (var j = 0; j < rule.rhs.length; j++) {
        var row_l = rule.lhs[j];
        var row_r = rule.rhs[j];
        for (var k = 0; k < row_r.length; k++) {
            var cell=row_r[k];

            //this is super intricate. uff. 
            var objects_l = getPossibleObjectsFromCell(state, row_l[k]);
            var layers = objects_l.map(n=>state.objects[n].layer);
            for (var l = 0; l < cell.length; l += 2) {
                var dir = cell[l];
                if (dir!==""){
                    continue;
                }
                var name = cell[l + 1];
                if (name in state.propertiesDict || objects_l.indexOf(name)>=0){
                    continue;
                }
                var r_layer = state.objects[name].layer;
                if (layers.indexOf(r_layer)===-1){
                    cell[l]='stationary';
                }
            }
        }
    }

}

function concretizeMovingRule(state, rule, lineNumber) {

    var shouldremove;
    var result = [rule];
    var modified = true;
    while (modified) {
        modified = false;
        for (var i = 0; i < result.length; i++) {
            //only need to iterate through lhs
            var cur_rule = result[i];
            shouldremove = false;
            for (var j = 0; j < cur_rule.lhs.length; j++) {
                var cur_rulerow = cur_rule.lhs[j];
                for (var k = 0; k < cur_rulerow.length; k++) {
                    var cur_cell = cur_rulerow[k];
                    var movings = getMovings(state, cur_cell); //finds aggregate directions
                    if (movings.length > 0) {
                        shouldremove = true;
                        modified = true;

                        //just do the base property, let future iterations take care of the others
                        var cand_name = movings[0][0];
                        var ambiguous_dir = movings[0][1];
                        var concreteDirs = directionaggregates[ambiguous_dir];
                        for (var l = 0; l < concreteDirs.length; l++) {
                            var concreteDirection = concreteDirs[l];
                            var newrule = deepCloneRule(cur_rule);

                            //deep copy replacements
                            newrule.movingReplacement = {};
                            for (var moveTerm in cur_rule.movingReplacement) {
                                if (cur_rule.movingReplacement.hasOwnProperty(moveTerm)) {
                                    var moveDat = cur_rule.movingReplacement[moveTerm];
                                    newrule.movingReplacement[moveTerm] = [moveDat[0], moveDat[1], moveDat[2],moveDat[3],moveDat[4],moveDat[5]];
                                }
                            }
                            newrule.aggregateDirReplacement = {};
                            for (var moveTerm in cur_rule.aggregateDirReplacement) {
                                if (cur_rule.aggregateDirReplacement.hasOwnProperty(moveTerm)) {
                                    var moveDat = cur_rule.aggregateDirReplacement[moveTerm];
                                    newrule.aggregateDirReplacement[moveTerm] = [moveDat[0], moveDat[1], moveDat[2]];
                                }                                
                            }

                            concretizeMovingInCell(newrule.lhs[j][k], ambiguous_dir, cand_name, concreteDirection);
                            if (newrule.rhs.length > 0) {
                                concretizeMovingInCell(newrule.rhs[j][k], ambiguous_dir, cand_name, concreteDirection); //do for the corresponding rhs cell as well
                            }

                            if (newrule.movingReplacement[cand_name+ambiguous_dir] === undefined) {
                                newrule.movingReplacement[cand_name+ambiguous_dir] = [concreteDirection, 1, ambiguous_dir,cand_name,j,k];
                            } else {
                                var mr = newrule.movingReplacement[cand_name+ambiguous_dir];
                                if (j!==mr[4] || k!==mr[5]){
                                    mr[1] = mr[1] + 1;
                                }
                            }
                            if (newrule.aggregateDirReplacement[ambiguous_dir] === undefined) {
                                newrule.aggregateDirReplacement[ambiguous_dir] = [concreteDirection, 1, ambiguous_dir];
                            } else {
                                newrule.aggregateDirReplacement[ambiguous_dir][1] = newrule.aggregateDirReplacement[ambiguous_dir][1] + 1;
                            }

                            result.push(newrule);
                        }
                    }
                }
            }
            if (shouldremove) {
                result.splice(i, 1);
                i--;
            }
        }
    }


    for (var i = 0; i < result.length; i++) {
        //for each rule
        var cur_rule = result[i];
        if (cur_rule.movingReplacement === undefined) {
            continue;
        }
        var ambiguous_movement_dict = {};
        //strict first - matches movement direction to objects
        //for each property replacement in that rule
        for (var cand_name in cur_rule.movingReplacement) {
            if (cur_rule.movingReplacement.hasOwnProperty(cand_name)) {
                var replacementInfo = cur_rule.movingReplacement[cand_name];
                var concreteMovement = replacementInfo[0];
                var occurrenceCount = replacementInfo[1];
                var ambiguousMovement = replacementInfo[2];
                var ambiguousMovement_attachedObject = replacementInfo[3];

                if (occurrenceCount === 1) {
                    //do the replacement
                    for (var j = 0; j < cur_rule.rhs.length; j++) {
                        var cellRow_rhs = cur_rule.rhs[j];
                        for (var k = 0; k < cellRow_rhs.length; k++) {
                            var cell = cellRow_rhs[k];
                            concretizeMovingInCell(cell, ambiguousMovement, ambiguousMovement_attachedObject, concreteMovement);
                        }
                    }
                }

            }
        }

        //I don't fully understand why the following part is needed (and I wrote this yesterday), but it's not obviously malicious.
        var ambiguous_movement_names_dict = {};
        for (var cand_name in cur_rule.aggregateDirReplacement) {
            if (cur_rule.aggregateDirReplacement.hasOwnProperty(cand_name)) {
                var replacementInfo = cur_rule.aggregateDirReplacement[cand_name];
                var concreteMovement = replacementInfo[0];
                var occurrenceCount = replacementInfo[1];
                var ambiguousMovement = replacementInfo[2];
                //are both the following boolean bits necessary, or just the latter? ah well, no harm it seems.
                if ((ambiguousMovement in ambiguous_movement_names_dict) || (occurrenceCount !== 1)) {
                    ambiguous_movement_names_dict[ambiguousMovement] = "INVALID";
                } else {
                    ambiguous_movement_names_dict[ambiguousMovement] = concreteMovement
                }
            }
        }        

        //for each ambiguous word, if there's a single ambiguous movement specified in the whole lhs, then replace that wholesale
        for (var ambiguousMovement in ambiguous_movement_dict) {
            if (ambiguous_movement_dict.hasOwnProperty(ambiguousMovement) && ambiguousMovement !== "INVALID") {
                concreteMovement = ambiguous_movement_dict[ambiguousMovement];
                if (concreteMovement === "INVALID") {
                    continue;
                }
                for (var j = 0; j < cur_rule.rhs.length; j++) {
                    var cellRow_rhs = cur_rule.rhs[j];
                    for (var k = 0; k < cellRow_rhs.length; k++) {
                        var cell = cellRow_rhs[k];
                        concretizeMovingInCellByAmbiguousMovementName(cell, ambiguousMovement, concreteMovement);
                    }
                }
            }
        }

        
        //further replacements - if a movement word appears once on the left, can use to disambiguate remaining ones on the right
        for (var ambiguousMovement in ambiguous_movement_names_dict) {
            if (ambiguous_movement_names_dict.hasOwnProperty(ambiguousMovement) && ambiguousMovement !== "INVALID") {
                concreteMovement = ambiguous_movement_names_dict[ambiguousMovement];
                if (concreteMovement === "INVALID") {
                    continue;
                }
                for (var j = 0; j < cur_rule.rhs.length; j++) {
                    var cellRow_rhs = cur_rule.rhs[j];
                    for (var k = 0; k < cellRow_rhs.length; k++) {
                        var cell = cellRow_rhs[k];
                        concretizeMovingInCellByAmbiguousMovementName(cell, ambiguousMovement, concreteMovement);
                    }
                }
            }
        }
    }

    //if any properties remain on the RHSes, bleep loudly
    var rhsAmbiguousMovementsRemain = '';
    for (var i = 0; i < result.length; i++) {
        var cur_rule = result[i];
        delete result.movingReplacement;
        for (var j = 0; j < cur_rule.rhs.length; j++) {
            var cur_rulerow = cur_rule.rhs[j];
            for (var k = 0; k < cur_rulerow.length; k++) {
                var cur_cell = cur_rulerow[k];
                var movings = getMovings(state, cur_cell);
                if (movings.length > 0) {
                    rhsAmbiguousMovementsRemain = movings[0][1];
                }
            }
        }
    }


    if (rhsAmbiguousMovementsRemain.length > 0) {
        logError('This rule has an ambiguous movement on the right-hand side, \"' + rhsAmbiguousMovementsRemain + "\", that can't be inferred from the left-hand side.  (either for every ambiguous movement associated to an entity on the right there has to be a corresponding one on the left attached to the same entity, OR, if there's a single occurrence of a particular ambiguous movement on the left, all properties of the same movement attached to the same object on the right are assumed to be the same (or something like that)).", lineNumber);
        state.invalid=true;
    }

    return result;
}

function rephraseSynonyms(state, rule) {
    for (var i = 0; i < rule.lhs.length; i++) {
        var cellrow_l = rule.lhs[i];
        var cellrow_r = rule.rhs[i];
        for (var j = 0; j < cellrow_l.length; j++) {
            var cell_l = cellrow_l[j];
            for (var k = 1; k < cell_l.length; k += 2) {
                var name = cell_l[k];
                if (name in state.synonymsDict) {
                    cell_l[k] = state.synonymsDict[cell_l[k]];
                }
            }
            if (rule.rhs.length > 0) {
                var cell_r = cellrow_r[j];
                for (var k = 1; k < cell_r.length; k += 2) {
                    var name = cell_r[k];
                    if (name in state.synonymsDict) {
                        cell_r[k] = state.synonymsDict[cell_r[k]];
                    }
                }
            }
        }
    }
}

function atomizeAggregates(state, rule) {
    for (var i = 0; i < rule.lhs.length; i++) {
        var cellrow = rule.lhs[i];
        for (var j = 0; j < cellrow.length; j++) {
            var cell = cellrow[j];
            atomizeCellAggregates(state, cell, rule.lineNumber);
        }
    }
    for (var i = 0; i < rule.rhs.length; i++) {
        var cellrow = rule.rhs[i];
        for (var j = 0; j < cellrow.length; j++) {
            var cell = cellrow[j];
            atomizeCellAggregates(state, cell, rule.lineNumber);
        }
    }
}

function atomizeCellAggregates(state, cell, lineNumber) {
    for (var i = 0; i < cell.length; i += 2) {
        var dir = cell[i];
        var c = cell[i + 1];
        if (c in state.aggregatesDict) {
            if (dir === 'no') {
                logError("You cannot use 'no' to exclude the aggregate object " + c.toUpperCase() + " (defined using 'AND'), only regular objects, or properties (objects defined using 'OR').  If you want to do this, you'll have to write it out yourself the long way.", lineNumber);
            }
            var equivs = state.aggregatesDict[c];
            cell[i + 1] = equivs[0];
            for (var j = 1; j < equivs.length; j++) {
                cell.push(cell[i]); //push the direction
                cell.push(equivs[j]);
            }
        }
    }
}

function convertRelativeDirsToAbsolute(rule) {
    var forward = rule.direction;
    for (var i = 0; i < rule.lhs.length; i++) {
        var cellrow = rule.lhs[i];
        for (var j = 0; j < cellrow.length; j++) {
            var cell = cellrow[j];
            absolutifyRuleCell(forward, cell);
        }
    }
    for (var i = 0; i < rule.rhs.length; i++) {
        var cellrow = rule.rhs[i];
        for (var j = 0; j < cellrow.length; j++) {
            var cell = cellrow[j];
            absolutifyRuleCell(forward, cell);
        }
    }
}

var relativeDirs = ['^', 'v', '<', '>', 'parallel', 'perpendicular']; //used to index the following
//I use _par/_perp just to keep track of providence for replacement purposes later.
var relativeDict = {
    'right': ['up', 'down', 'left', 'right', 'horizontal_par', 'vertical_perp'],
    'up': ['left', 'right', 'down', 'up', 'vertical_par', 'horizontal_perp'],
    'down': ['right', 'left', 'up', 'down', 'vertical_par', 'horizontal_perp'],
    'left': ['down', 'up', 'right', 'left', 'horizontal_par', 'vertical_perp']
};

function absolutifyRuleCell(forward, cell) {
    for (var i = 0; i < cell.length; i += 2) {
        var c = cell[i];
        var index = relativeDirs.indexOf(c);
        if (index >= 0) {
            cell[i] = relativeDict[forward][index];
        }
    }
}
/*
	direction mask
	UP parseInt('%1', 2);
	DOWN parseInt('0', 2);
	LEFT parseInt('0', 2);
	RIGHT parseInt('0', 2);
	?  parseInt('', 2);

*/

var dirMasks = {
    'up': parseInt('00001', 2),
    'down': parseInt('00010', 2),
    'left': parseInt('00100', 2),
    'right': parseInt('01000', 2),
    'moving': parseInt('01111', 2),
    'no': parseInt('00011', 2),
    'randomdir': parseInt('00101', 2),
    'random': parseInt('10010', 2),
    'action': parseInt('10000', 2),
    '': parseInt('00000', 2)
};

function rulesToMask(state) {
    /*

    */
    var layerCount = state.collisionLayers.length;
    var layerTemplate = [];
    for (var i = 0; i < layerCount; i++) {
        layerTemplate.push(null);
    }

    for (var i = 0; i < state.rules.length; i++) {
        var rule = state.rules[i];
        for (var j = 0; j < rule.lhs.length; j++) {
            var cellrow_l = rule.lhs[j];
            var cellrow_r = rule.rhs[j];
            for (var k = 0; k < cellrow_l.length; k++) {
                var cell_l = cellrow_l[k];
                var layersUsed_l = layerTemplate.concat([]);
                var objectsPresent = new BitVec(STRIDE_OBJ);
                var objectsMissing = new BitVec(STRIDE_OBJ);
                var anyObjectsPresent = [];
                var movementsPresent = new BitVec(STRIDE_MOV);
                var movementsMissing = new BitVec(STRIDE_MOV);

                var objectlayers_l = new BitVec(STRIDE_MOV);
                for (var l = 0; l < cell_l.length; l += 2) {
                    var object_dir = cell_l[l];
                    if (object_dir === '...') {
                        objectsPresent = ellipsisPattern;
                        if (cell_l.length !== 2) {
                            logError("You can't have anything in with an ellipsis. Sorry.", rule.lineNumber);
                            throw 'aborting compilation';//throwing here because I was getting infinite loops in the compiler otherwise
                        } else if ((k === 0) || (k === cellrow_l.length - 1)) {
                            logError("There's no point in putting an ellipsis at the very start or the end of a rule", rule.lineNumber);
                        } else if (rule.rhs.length > 0) {
                            var rhscell = cellrow_r[k];
                            if (rhscell.length !== 2 || rhscell[0] !== '...') {
                                logError("An ellipsis on the left must be matched by one in the corresponding place on the right.", rule.lineNumber);
                            }
                        }
                        break;
                    } else if (object_dir === 'random') {
                        logError("RANDOM cannot be matched on the left-hand side, it can only appear on the right", rule.lineNumber);
                        continue;
                    }

                    var object_name = cell_l[l + 1];
                    var object = state.objects[object_name];
                    var objectMask = state.objectMasks[object_name];
                    if (object) {
                        var layerIndex = object.layer | 0;
                    } else {
                        var layerIndex = state.propertiesSingleLayer[object_name];
                    }

                    if (typeof(layerIndex) === "undefined") {
                        logError("Oops!  " + object_name.toUpperCase() + " not assigned to a layer.", rule.lineNumber);
                    }

                    if (object_dir === 'no') {
                        objectsMissing.ior(objectMask);
                    } else {
                        var existingname = layersUsed_l[layerIndex];
                        if (existingname !== null) {
                            rule.discard=[object_name.toUpperCase(), existingname.toUpperCase()];
                        }

                        layersUsed_l[layerIndex] = object_name;

                        if (object) {
                            objectsPresent.ior(objectMask);
                            objectlayers_l.ishiftor(0x1f, 5 * layerIndex);
                        } else {
                            anyObjectsPresent.push(objectMask);
                        }

                        if (object_dir === 'stationary') {
                            movementsMissing.ishiftor(0x1f, 5 * layerIndex);
                        } else {
                            movementsPresent.ishiftor(dirMasks[object_dir], 5 * layerIndex);
                        }
                    }
                }

                if (rule.rhs.length > 0) {
                    var rhscell = cellrow_r[k];
                    var lhscell = cellrow_l[k];
                    if (rhscell[0] === '...' && lhscell[0] !== '...') {
                        logError("An ellipsis on the right must be matched by one in the corresponding place on the left.", rule.lineNumber);
                    }
                    for (var l = 0; l < rhscell.length; l += 2) {
                        var content = rhscell[l];
                        if (content === '...') {
                            if (rhscell.length !== 2) {
                                logError("You can't have anything in with an ellipsis. Sorry.", rule.lineNumber);
                            }
                        }
                    }
                }

                if (objectsPresent === ellipsisPattern) {
                    cellrow_l[k] = ellipsisPattern;
                    continue;
                } else {
                    cellrow_l[k] = new CellPattern([objectsPresent, objectsMissing, anyObjectsPresent, movementsPresent, movementsMissing, null]);
                }

                //if X no X, then cancel
                if (objectsPresent.anyBitsInCommon(objectsMissing)){
                    //if I'm about the remove the last representative of this line number, throw an error
                    var ln = rule.lineNumber;
                    if ( (i>0 && state.rules[i-1].lineNumber===ln) || ( (i+1<state.rules.length) && state.rules[i+1].lineNumber===ln)){
                        //all good
                    } else {
                        logWarning('This rule has some content of the form "X no X" (either directly or maybe indirectly - check closely how the terms are defined if nothing stands out) which can never match and so the rule is getting removed during compilation.', rule.lineNumber);
                    }
                    state.rules.splice(i,1);
                    i--;
                    continue;
                }
                
                if (rule.rhs.length === 0) {
                    continue;
                }

                var cell_r = cellrow_r[k];
                var layersUsed_r = layerTemplate.concat([]);
                var layersUsedRand_r = layerTemplate.concat([]);

                var objectsClear = new BitVec(STRIDE_OBJ);
                var objectsSet = new BitVec(STRIDE_OBJ);
                var movementsClear = new BitVec(STRIDE_MOV);
                var movementsSet = new BitVec(STRIDE_MOV);

                var objectlayers_r = new BitVec(STRIDE_MOV);
                var randomMask_r = new BitVec(STRIDE_OBJ);
                var postMovementsLayerMask_r = new BitVec(STRIDE_MOV);
                var randomDirMask_r = new BitVec(STRIDE_MOV);
                for (var l = 0; l < cell_r.length; l += 2) {
                    var object_dir = cell_r[l];
                    var object_name = cell_r[l + 1];

                    if (object_dir === '...') {
                        //logError("spooky ellipsis found! (should never hit this)");
                        break;
                    } else if (object_dir === 'random') {
                        if (object_name in state.objectMasks) {
                            var mask = state.objectMasks[object_name];
                            randomMask_r.ior(mask);
                            var values;
                            if (state.propertiesDict.hasOwnProperty(object_name)) {
                                values = state.propertiesDict[object_name];
                            } else {
                                //get line number declaration of object_name
                                logWarning(`In this rule you're asking me to spawn a random ${object_name.toUpperCase()} for you, but that's already a concrete single object.  You wanna be using random with properties (things defined in terms of OR in the legend) so there's some things to select between.`, rule.lineNumber);
                                values = [object_name];
                            }
                            for (var m = 0; m < values.length; m++) {
                                var subobject = values[m];
                                var layerIndex = state.objects[subobject].layer | 0;
                                var existingname = layersUsed_r[layerIndex];
                                if (existingname !== null) {
                                    var o1 = subobject.toUpperCase();
                                    var o2 = existingname.toUpperCase();
                                    if (o1 !== o2) {
                                        logWarning("This rule may try to spawn a " + o1 + " with random, but also requires a " + o2 + " be here, which is on the same layer - they shouldn't be able to coexist!", rule.lineNumber);
                                    }
                                }

                                layersUsedRand_r[layerIndex] = subobject;
                            }

                        } else {
                            logError('You want to spawn a random "' + object_name.toUpperCase() + '", but I don\'t know how to do that', rule.lineNumber);
                        }
                        continue;
                    }

                    var object = state.objects[object_name];
                    var objectMask = state.objectMasks[object_name];
                    if (object) {
                        var layerIndex = object.layer | 0;
                    } else {
                        var layerIndex = state.propertiesSingleLayer[object_name];
                    }


                    if (object_dir == 'no') {
                        objectsClear.ior(objectMask);
                    } else {
                        var existingname = layersUsed_r[layerIndex];
                        if (existingname === null) {
                            existingname = layersUsedRand_r[layerIndex];
                        }

                        if (existingname !== null) {
                            if (rule.hasOwnProperty('discard')) {

                            } else {
                                logError('Rule matches object types that can\'t overlap: "' + object_name.toUpperCase() + '" and "' + existingname.toUpperCase() + '".', rule.lineNumber);
                            }
                        }

                        layersUsed_r[layerIndex] = object_name;

                        if (object_dir.length > 0) {
                            postMovementsLayerMask_r.ishiftor(0x1f, 5 * layerIndex);
                        }

                        var layerMask = state.layerMasks[layerIndex];

                        if (object) {
                            objectsSet.ibitset(object.id);
                            objectsClear.ior(layerMask);
                            objectlayers_r.ishiftor(0x1f, 5 * layerIndex);
                        } else {
                            // shouldn't need to do anything here...
                        }
                        //possibility - if object not present on lhs in same position, clear movement
                        if (object_dir === 'stationary') {
                            movementsClear.ishiftor(0x1f, 5 * layerIndex);
                        }                
                        if (object_dir === 'randomdir') {
                            randomDirMask_r.ishiftor(dirMasks[object_dir], 5 * layerIndex);
                        } else {
                            movementsSet.ishiftor(dirMasks[object_dir], 5 * layerIndex);
                        };
                    }
                }

                //I don't know why these two ifs here are needed.
                if (!(objectsPresent.bitsSetInArray(objectsSet.data))) {
                    objectsClear.ior(objectsPresent); // clear out old objects
                }
                if (!(movementsPresent.bitsSetInArray(movementsSet.data))) {
                    movementsClear.ior(movementsPresent); // ... and movements
                }

                /*
                for rules like this I want to clear movements on newly-spawned entities
                    [ >  Player | Crate ] -> [  >  Player | > Crate  ]
                    [ > Player | ] -> [ Crate | Player ]

                WITHOUT havin this rule remove movements
                    [ > Player | ] -> [ Crate | Player ]
                (bug #492)
                */
               
                for (var l = 0; l < layerCount; l++) {
                    if (layersUsed_l[l] !== null && layersUsed_r[l] === null) {
                        // a layer matched on the lhs, but not on the rhs
                        objectsClear.ior(state.layerMasks[l]);
                        postMovementsLayerMask_r.ishiftor(0x1f, 5 * l);
                    }
                }

                objectlayers_l.iclear(objectlayers_r);

                postMovementsLayerMask_r.ior(objectlayers_l);
                if (!objectsClear.iszero() || !objectsSet.iszero() || !movementsClear.iszero() || !movementsSet.iszero() || !postMovementsLayerMask_r.iszero() || !randomMask_r.iszero() || !randomDirMask_r.iszero()) {
                    // only set a replacement if something would change
                    cellrow_l[k].replacement = new CellReplacement([objectsClear, objectsSet, movementsClear, movementsSet, postMovementsLayerMask_r, randomMask_r, randomDirMask_r]);
                } 
            }
        }
    }
}

function cellRowMasks(rule) {
    var ruleMasks = [];
    var lhs = rule[1];
    for (var i = 0; i < lhs.length; i++) {
        var cellRow = lhs[i];
        var rowMask = new BitVec(STRIDE_OBJ);
        for (var j = 0; j < cellRow.length; j++) {
            if (cellRow[j] === ellipsisPattern)
                continue;
            rowMask.ior(cellRow[j].objectsPresent);
        }
        ruleMasks.push(rowMask);
    }
    return ruleMasks;
}

function cellRowMasks_Movements(rule){
    var ruleMasks_mov = [];
    var lhs = rule[1];
    for (var i = 0; i < lhs.length; i++) {
        var cellRow = lhs[i];
        var rowMask = new BitVec(STRIDE_MOV);
        for (var j = 0; j < cellRow.length; j++) {
            if (cellRow[j] === ellipsisPattern)
                continue;
            rowMask.ior(cellRow[j].movementsPresent);
        }
        ruleMasks_mov.push(rowMask);
    }
    return ruleMasks_mov;
}

function collapseRules(groups) {
    for (var gn = 0; gn < groups.length; gn++) {
        var rules = groups[gn];
        for (var i = 0; i < rules.length; i++) {
            var oldrule = rules[i];
            var newrule = [0, [], oldrule.rhs.length > 0, oldrule.lineNumber /*ellipses,group number,rigid,commands,randomrule,[cellrowmasks]*/ ];
            var ellipses = [];
            for (var j = 0; j < oldrule.lhs.length; j++) {
                ellipses.push(0);
            }

            newrule[0] = dirMasks[oldrule.direction];
            for (var j = 0; j < oldrule.lhs.length; j++) {
                var cellrow_l = oldrule.lhs[j];
                for (var k = 0; k < cellrow_l.length; k++) {
                    if (cellrow_l[k] === ellipsisPattern) {
                        ellipses[j] ++;
                        if (ellipses[j]>2) {
                            logError("You can't use more than two ellipses in a single cell match pattern.", oldrule.lineNumber);
                        } else {
                            if (k>0 && cellrow_l[k-1]===ellipsisPattern){
                                logWarning("Why would you go and have two ellipses in a row like that? It's exactly the same as just having a single ellipsis, right?", oldrule.lineNumber);
                            }
                        }
                    }
                }
                newrule[1][j] = cellrow_l;
            }
            newrule.push(ellipses);
            newrule.push(oldrule.groupNumber);
            newrule.push(oldrule.rigid);
            newrule.push(oldrule.commands);
            newrule.push(oldrule.randomRule);
            newrule.push(cellRowMasks(newrule));
            newrule.push(cellRowMasks_Movements(newrule));
            rules[i] = new Rule(newrule);
        }
    }
    matchCache = {}; // clear match cache so we don't slowly leak memory
}



function ruleGroupDiscardOverlappingTest(ruleGroup) {
    if (ruleGroup.length === 0)
        return;
    
    var discards=[];

    for (var i = 0; i < ruleGroup.length; i++) {
        var rule = ruleGroup[i];
        if (rule.hasOwnProperty('discard')) {
            
            var beforesame = i===0 ? false : ruleGroup[i-1].lineNumber === rule.lineNumber;
            var aftersame = i===(ruleGroup.length-1) ? false : ruleGroup[i+1].lineNumber === rule.lineNumber;

            ruleGroup.splice(i, 1);
            
            var found=false;
            for(var j=0;j<discards.length;j++){
                var discard=discards[j];
                if (discard[0]===rule.discard[0] && discard[1]===rule.discard[1]){
                    found=true;
                    break;
                }
            }
            if(!found){
                discards.push(rule.discard)
            }

            //if rule before isn't of same linenumber, and rule after isn't of same linenumber, 
            //then a rule has been totally erased and you should throw an error!
            if ( !(beforesame||aftersame) || ruleGroup.length===0) {
                
                const example = discards[0];
                
                var parenthetical = "";
                if (discards.length>1){
                    parenthetical = " (ditto for ";
                    for (var j=1;j<discards.length;j++){
                        if (j>1){
                            parenthetical+=", "
                            
                            if (j===discards.length-1){
                                parenthetical += "and ";
                            }
                        }

                        const thisdiscard = discards[j];
                        const p1 = thisdiscard[0];
                        const p2 = thisdiscard[1];
                        parenthetical += `${p1}/${p2}`;

                        if (j===3 && discards.length>4){
                            parenthetical+=" etc.";
                            break;
                        }
                    }
                    parenthetical += ")";
                }

                logError(`${example[0]} and ${example[1]} can never overlap${parenthetical}, but this rule requires that to happen, so it's being culled.`, rule.lineNumber);
            }
            i--;
        }
    }
}

function arrangeRulesByGroupNumber(state) {
    var aggregates = {};
    var aggregates_late = {};
    for (var i = 0; i < state.rules.length; i++) {
        var rule = state.rules[i];
        var targetArray = aggregates;
        if (rule.late) {
            targetArray = aggregates_late;
        }

        if (targetArray[rule.groupNumber] == undefined) {
            targetArray[rule.groupNumber] = [];
        }
        targetArray[rule.groupNumber].push(rule);
    }

    var result = [];
    for (var groupNumber in aggregates) {
        if (aggregates.hasOwnProperty(groupNumber)) {
            var ruleGroup = aggregates[groupNumber];
            ruleGroupDiscardOverlappingTest(ruleGroup);
            if (ruleGroup.length > 0) {
                result.push(ruleGroup);
            }
        }
    }
    var result_late = [];
    for (var groupNumber in aggregates_late) {
        if (aggregates_late.hasOwnProperty(groupNumber)) {
            var ruleGroup = aggregates_late[groupNumber];
            ruleGroupDiscardOverlappingTest(ruleGroup);
            if (ruleGroup.length > 0) {
                result_late.push(ruleGroup);
            }
        }
    }
    state.rules = result;

    //check that there're no late movements with direction requirements on the lhs
    state.lateRules = result_late;
}

function generateRigidGroupList(state) {
    var rigidGroupIndex_to_GroupIndex = [];
    var groupIndex_to_RigidGroupIndex = [];
    var groupNumber_to_GroupIndex = [];
    var groupNumber_to_RigidGroupIndex = [];
    var rigidGroups = [];
    for (var i = 0; i < state.rules.length; i++) {
        var ruleset = state.rules[i];
        var rigidFound = false;
        for (var j = 0; j < ruleset.length; j++) {
            var rule = ruleset[j];
            if (rule.isRigid) {
                rigidFound = true;
            }
        }
        rigidGroups[i] = rigidFound;
        if (rigidFound) {
            var groupNumber = ruleset[0].groupNumber;
            groupNumber_to_GroupIndex[groupNumber] = i;
            var rigid_group_index = rigidGroupIndex_to_GroupIndex.length;
            groupIndex_to_RigidGroupIndex[i] = rigid_group_index;
            groupNumber_to_RigidGroupIndex[groupNumber] = rigid_group_index;
            rigidGroupIndex_to_GroupIndex.push(i);
        }
    }
    if (rigidGroupIndex_to_GroupIndex.length > 30) {
        var group_index = rigidGroupIndex_to_GroupIndex[30];
        logError("There can't be more than 30 rigid groups (rule groups containing rigid members).", state.rules[group_index][0].lineNumber);
    }

    state.rigidGroups = rigidGroups;
    state.rigidGroupIndex_to_GroupIndex = rigidGroupIndex_to_GroupIndex;
    state.groupNumber_to_RigidGroupIndex = groupNumber_to_RigidGroupIndex;
    state.groupIndex_to_RigidGroupIndex = groupIndex_to_RigidGroupIndex;
}

function getMaskFromName(state, name) {
    var objectMask = new BitVec(STRIDE_OBJ);
    if (name in state.objects) {
        var o = state.objects[name];
        objectMask.ibitset(o.id);
    }

    if (name in state.aggregatesDict) {
        var objectnames = state.aggregatesDict[name];
        for (var i = 0; i < objectnames.length; i++) {
            var n = objectnames[i];
            var o = state.objects[n];
            objectMask.ibitset(o.id);
        }
    }

    if (name in state.propertiesDict) {
        var objectnames = state.propertiesDict[name];
        for (var i = 0; i < objectnames.length; i++) {
            var n = objectnames[i];
            var o = state.objects[n];
            objectMask.ibitset(o.id);
        }
    }

    if (name in state.synonymsDict) {
        var n = state.synonymsDict[name];
        var o = state.objects[n];
        objectMask.ibitset(o.id);
    }

    if (objectMask.iszero()) {
        logErrorNoLine("error, didn't find any object called player, either in the objects section, or the legends section. there must be a player!");
    }
    return objectMask;
}

function generateMasks(state) {
    state.playerMask = getMaskFromName(state, 'player');

    var layerMasks = [];
    var layerCount = state.collisionLayers.length;
    for (var layer = 0; layer < layerCount; layer++) {
        var layerMask = new BitVec(STRIDE_OBJ);
        for (var j = 0; j < state.objectCount; j++) {
            var n = state.idDict[j];
            var o = state.objects[n];
            if (o.layer == layer) {
                layerMask.ibitset(o.id);
            }
        }
        layerMasks.push(layerMask);
    }
    state.layerMasks = layerMasks;

    var objectMask = {};
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var o = state.objects[n];
            objectMask[n] = new BitVec(STRIDE_OBJ);
            objectMask[n].ibitset(o.id);
        }
    }

    // Synonyms can depend on properties, and properties can depend on synonyms.
    // Process them in order by combining & sorting by linenumber.

    var synonyms_and_properties = state.legend_synonyms.concat(state.legend_properties);
    synonyms_and_properties.sort(function(a, b) {
        return a.lineNumber - b.lineNumber;
    });

    for (var i = 0; i < synonyms_and_properties.length; i++) {
        var synprop = synonyms_and_properties[i];
        if (synprop.length == 2) {
            // synonym (a = b)
            objectMask[synprop[0]] = objectMask[synprop[1]];
        } else {
            // property (a = b or c)
            var val = new BitVec(STRIDE_OBJ);
            for (var j = 1; j < synprop.length; j++) {
                var n = synprop[j];
                val.ior(objectMask[n]);
            }
            objectMask[synprop[0]] = val;
        }
    }

    //use \n as a delimeter for internal-only objects
    var all_obj = new BitVec(STRIDE_OBJ);
    all_obj.inot();
    objectMask["\nall\n"] = all_obj;

    state.objectMasks = objectMask;

    
    state.aggregateMasks = {};

    //set aggregate masks similarly
    for (var aggregateName of Object.keys(state.aggregatesDict)) {
        var objectnames = state.aggregatesDict[aggregateName];
        
        var aggregateMask = new BitVec(STRIDE_OBJ);
        for (var i = 0; i < objectnames.length; i++) {
            var n = objectnames[i];
            var o = state.objects[n];
            aggregateMask.ior(objectMask[n]);
        }
        state.aggregateMasks[aggregateName] = aggregateMask;
    }
}

function checkObjectsAreLayered(state) {
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var found = false;
            for (var i = 0; i < state.collisionLayers.length; i++) {
                var layer = state.collisionLayers[i];
                for (var j = 0; j < layer.length; j++) {
                    if (layer[j] === n) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
            if (found === false) {
                var o = state.objects[n];
                logError('Object "' + n.toUpperCase() + '" has been defined, but not assigned to a layer.', o.lineNumber);
            }
        }
    }
}

function isInt(value) {
return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

function twiddleMetaData(state) {
    var newmetadata = {};
    for (var i = 0; i < state.metadata.length; i += 2) {
        var key = state.metadata[i];
        var val = state.metadata[i + 1];
        newmetadata[key] = val;
    }


    const getIntCheckedPositive = function(s,lineNumber){
        if (!isFinite(s) || !isInt(s)){
            logWarning(`Wasn't able to make sense of "${s}" as a (whole number) dimension.`,lineNumber);
            return NaN;
        }
        var result = parseInt(s);
        if (isNaN(result)){
            logWarning(`Wasn't able to make sense of "${s}" as a dimension.`,lineNumber);
        }
        if (result<=0){
            logWarning(`The dimension given to me (you gave "${s}") is baad - it should be greater than 0.`,lineNumber);
        }
        return result;
    }
    const getCoords = function(str,lineNumber){
        var coords = val.split('x');
        if (coords.length!==2){
            logWarning("Dimensions must be of the form AxB.",lineNumber);
            return null;
        } else {
            var intcoords = [getIntCheckedPositive(coords[0],lineNumber), getIntCheckedPositive(coords[1],lineNumber)];
            if (!isFinite(coords[0]) || !isFinite(coords[1]) || isNaN(intcoords[0]) || isNaN(intcoords[1])) {
                logWarning(`Couldn't understand the dimensions given to me (you gave "${val}") - should be of the form AxB.`,lineNumber);
                return null
            } else {
                if (intcoords[0]<=0 || intcoords[1]<=0){
                    logWarning(`The dimensions given to me (you gave "${val}") are baad - they should be > 0.`,lineNumber);
                }
                return intcoords;
            }
        }
    }
    if (newmetadata.flickscreen !== undefined) {
        var val = newmetadata.flickscreen;
        newmetadata.flickscreen = getCoords(val,state.metadata_lines.flickscreen);
        if (newmetadata.flickscreen===null){
            delete newmetadata.flickscreen;
        }
    }
    if (newmetadata.zoomscreen !== undefined) {
        var val = newmetadata.zoomscreen;
        newmetadata.zoomscreen = getCoords(val,state.metadata_lines.zoomscreen);
        if (newmetadata.zoomscreen===null){
            delete newmetadata.zoomscreen;
        }
    }

    state.metadata = newmetadata;
}

function processWinConditions(state) {
    //	[-1/0/1 (no,some,all),ob1,ob2] (ob2 is background by default)
    var newconditions = [];
    for (var i = 0; i < state.winconditions.length; i++) {
        var wincondition = state.winconditions[i];
        if (wincondition.length == 0) {
            //I feel like here should never be reached, right? Not sure if it warrants an error though.
            return;
        }
        var num = 0;
        switch (wincondition[0]) {
            case 'no':
                { num = -1; break; }
            case 'all':
                { num = 1; break; }
        }

        var lineNumber = wincondition[wincondition.length - 1];

        var n1 = wincondition[1];
        var n2;
        if (wincondition.length == 5) {
            n2 = wincondition[3];
        } else {
            n2 = '\nall\n';
        }

        var mask1 = 0;
        var mask2 = 0;
        var aggr1 = false;
        var aggr2 = false;

        if (n1 in state.objectMasks) {
            aggr1 = false;
            mask1 = state.objectMasks[n1];
        } else if (n1 in state.aggregateMasks){
            aggr1 = true;
            mask1 = state.aggregateMasks[n1];
        } else {
            logError('Unwelcome term "' + n1 + '" found in win condition. I don\'t know what I\'m supposed to do with this. ', lineNumber);
        }
        if (n2 in state.objectMasks) {
            aggr2=false;
            mask2 = state.objectMasks[n2];
        } else if (n2 in state.aggregateMasks){
            aggr2 = true;
            mask2 = state.aggregateMasks[n2];
        } else  {
            logError('Unwelcome term "' + n1 + '" found in win condition. I don\'t know what I\'m supposed to do with this. ', lineNumber);
        }
        var newcondition = [num, mask1, mask2, lineNumber, aggr1, aggr2];
        newconditions.push(newcondition);
    }
    state.winconditions = newconditions;
}

function printCellRow(cellRow) {
    var result = "[ ";
    for (var i = 0; i < cellRow.length; i++) {
        if (i > 0) {
            result += "| ";
        }
        var cell = cellRow[i];
        for (var j = 0; j < cell.length; j += 2) {
            var direction = cell[j];
            var object = cell[j + 1]
            if (direction === "...") {
                result += direction + " ";
            } else {
                result += direction + " " + object + " ";
            }
        }
    }
    result += "] ";
    return result;
}

function cacheRuleStringRep(rule) {
    var result = "(<a onclick=\"jumpToLine('" + rule.lineNumber.toString() + "');\"  href=\"javascript:void(0);\">" + rule.lineNumber + "</a>) " + rule.direction.toString().toUpperCase() + " ";
    if (rule.rigid) {
        result = "RIGID " + result + " ";
    }
    if (rule.randomRule) {
        result = "RANDOM " + result + " ";
    }
    if (rule.late) {
        result = "LATE " + result + " ";
    }
    for (var i = 0; i < rule.lhs.length; i++) {
        var cellRow = rule.lhs[i];
        result = result + printCellRow(cellRow);
    }
    result = result + "-> ";
    for (var i = 0; i < rule.rhs.length; i++) {
        var cellRow = rule.rhs[i];
        result = result + printCellRow(cellRow);
    }
    for (var i = 0; i < rule.commands.length; i++) {
        var command = rule.commands[i];
        if (command.length === 1) {
            result = result + command[0].toString();
        } else {
            result = result + '(' + command[0].toString() + ", " + command[1].toString() + ') ';
        }
    }
    //print commands next
    rule.stringRep = result;
}

function cacheAllRuleNames(state) {

    for (var i = 0; i < state.rules.length; i++) {
        var rule = state.rules[i];
        cacheRuleStringRep(rule);
    }
}

function printRules(state) {
    var output = "";
    var loopIndex = 0;
    var loopEnd = -1;
    var discardcount = 0;
    for (var i = 0; i < state.rules.length; i++) {
        var rule = state.rules[i];
        if (loopIndex < state.loops.length) {
            if (state.loops[loopIndex][0] < rule.lineNumber) {
                output += "STARTLOOP<br>";
                loopIndex++;
                if (loopIndex < state.loops.length) { // don't die with mismatched loops
                    loopEnd = state.loops[loopIndex][0];
                    loopIndex++;
                }
            }
        }
        if (loopEnd !== -1 && loopEnd < rule.lineNumber) {
            output += "ENDLOOP<br>";
            loopEnd = -1;
        }
        if (rule.hasOwnProperty('discard')) {
            discardcount++;
        } else {
            var sameGroupAsPrevious = i>0 && state.rules[i-1].groupNumber === rule.groupNumber;
            if (sameGroupAsPrevious){
                output += '+ ';
            } else {
                output += '&nbsp;&nbsp;';
            }
            output += rule.stringRep + "<br>";
        }
    }
    if (loopEnd !== -1) { // no more rules after loop end
        output += "ENDLOOP<br>";
    }
    output += "===========<br>";
    output = "<br>Rule Assembly : (" + (state.rules.length - discardcount) + " rules)<br>===========<br>" + output;
    consolePrint(output);
}

function removeDuplicateRules(state) {
    var record = {};
    var newrules = [];
    var lastgroupnumber = -1;
    for (var i = state.rules.length - 1; i >= 0; i--) {
        var r = state.rules[i];
        var groupnumber = r.groupNumber;
        if (groupnumber !== lastgroupnumber) {
            record = {};
        }
        var r_string = r.stringRep;
        if (record.hasOwnProperty(r_string)) {
            state.rules.splice(i, 1);
        } else {
            record[r_string] = true;
        }
        lastgroupnumber = groupnumber;
    }
}

function generateLoopPoints(state) {
    var loopPoint = {};
    var loopPointIndex = 0;
    var outside = true;
    var source = 0;
    var target = 0;
    if (state.loops.length > 0) {
        for (var i=0;i<state.loops.length;i++){
            var loop = state.loops[i];
            if (i%2===0){
                if (loop[1]===-1){         
                    logError("Found an ENDLOOP, but I'm not in a loop?",loop[0]);
                }
            } else {
                if (loop[1]===1){         
                    logError("Found a STARTLOOP, but I'm already inside a loop? (Puzzlescript can't nest loops, FWIW).",loop[0]);
                }
            }
        }
        var lastloop=state.loops[state.loops.length-1];
        if (lastloop[1]!==-1){
            logError("Yo I found a STARTLOOP without a corresponding ENDLOOP.",lastloop[0]);

        }
        // logError("Have to have matching number of  'startLoop' and 'endLoop' loop points.",state.loops[state.loops.length-1][0]);
    }

    for (var j = 0; j < state.loops.length; j++) {
        var loop = state.loops[j];
        for (var i = 0; i < state.rules.length; i++) {
            var ruleGroup = state.rules[i];

            var firstRule = ruleGroup[0];
            var lastRule = ruleGroup[ruleGroup.length - 1];

            var firstRuleLine = firstRule.lineNumber;
            var lastRuleLine = lastRule.lineNumber;

            if (loop[0] >= firstRuleLine && loop[0] <= lastRuleLine) {
                logWarning("Found a loop point in the middle of a rule. You probably don't want to do this, right?", loop[0]);
            }
            if (outside) {
                if (firstRuleLine >= loop[0]) {
                    target = i;
                    outside = false;
                    break;
                }
            } else {
                if (firstRuleLine >= loop[0]) {
                    source = i - 1;
                    loopPoint[source] = target;
                    outside = true;
                    break;
                }
            }
        }
    }
    if (outside === false) {
        var source = state.rules.length;
        loopPoint[source] = target;
    } else {}
    state.loopPoint = loopPoint;

    loopPoint = {};
    outside = true;
    for (var j = 0; j < state.loops.length; j++) {
        var loop = state.loops[j];
        for (var i = 0; i < state.lateRules.length; i++) {
            var ruleGroup = state.lateRules[i];

            var firstRule = ruleGroup[0];
            var lastRule = ruleGroup[ruleGroup.length - 1];

            var firstRuleLine = firstRule.lineNumber;
            var lastRuleLine = lastRule.lineNumber;

            if (outside) {
                if (firstRuleLine >= loop[0]) {
                    target = i;
                    outside = false;
                    break;
                }
            } else {
                if (firstRuleLine >= loop[0]) {
                    source = i - 1;
                    loopPoint[source] = target;
                    outside = true;
                    break;
                }
            }
        }
    }
    if (outside === false) {
        var source = state.lateRules.length;
        loopPoint[source] = target;
    } else {}
    state.lateLoopPoint = loopPoint;
}

var soundDirectionIndicatorMasks = {
    'up': parseInt('00001', 2),
    'down': parseInt('00010', 2),
    'left': parseInt('00100', 2),
    'right': parseInt('01000', 2),
    'horizontal': parseInt('01100', 2),
    'vertical': parseInt('00011', 2),
    'orthogonal': parseInt('01111', 2),
    '___action____': parseInt('10000', 2)
};

var soundDirectionIndicators = ["up", "down", "left", "right", "horizontal", "vertical", "orthogonal", "___action____"];


function generateSoundData(state) {
    var sfx_Events = {};
    var sfx_CreationMasks = [];
    var sfx_DestructionMasks = [];
    var sfx_MovementMasks = state.collisionLayers.map(x => []);
    var sfx_MovementFailureMasks = [];

    for (var i = 0; i < state.sounds.length; i++) {
        var sound = state.sounds[i];
        if (sound.length <= 1) {
            //don't see that this would ever be triggered
            continue;
        }
        var lineNumber = sound[sound.length - 1];

        if (sound.length === 2) {
            logWarning('incorrect sound declaration.', lineNumber);
            continue;
        }

        const v0=sound[0][0].trim();
        const t0=sound[0][1].trim();
        const v1=sound[1][0].trim();
        const t1=sound[1][1].trim();
        
        var seed = sound[sound.length - 2][0];
        var seed_t = sound[sound.length - 2][1];
        if (seed_t !== 'SOUND') {
            // unreachable?
            // seems to be pre-empted by "Was expecting a soundverb here 
            // (MOVE, DESTROY, CANTMOVE, or the like), but found something else" message
            logError("Expecting sfx data, instead found \"" + seed + "\".", lineNumber);
        }

        if (t0 === "SOUNDEVENT") {

            //pretty sure neither of the following are reachable, they're caught by the parser before.
            if (sound.length > 4) {
                logError("too much stuff to define a sound event.", lineNumber);
            } else {
                //out of an abundance of caution, doing a fallback warning rather than expanding the scope of the error #779
                if (sound.length > 3) {
                    logWarning("too much stuff to define a sound event.", lineNumber);
                }
            }

            if (sfx_Events[v0] !== undefined) {
                logWarning(v0.toUpperCase() + " already declared.", lineNumber);
            }
            sfx_Events[v0] = seed;

        } else {
            var target = v0;
            var verb = v1;
            var directions = [];
            for (var j=2;j<sound.length-2;j++){//avoid last sound declaration as well as the linenumber element at the end
                if (sound[j][1] === 'DIRECTION') {
                    directions.push(sound[j][0]);      
                } else {
                    //Don't think I can get here, but just in case
                    logError(`Expected a direction here, but found instead "$(sound[j][0])".`, lineNumber);
                }
            }
            if (directions.length > 0 && (verb !== 'move' && verb !== 'cantmove')) {
                //this is probably unreachable, as the parser catches it before it gets here
                logError('Incorrect sound declaration - cannot have directions (UP/DOWN/etc.) attached to non-directional sound verbs (CREATE is not directional, but MOVE is directional).', lineNumber);
            }

            if (verb === 'action') {
                verb = 'move';
                directions = ['___action____'];
            }

            if (directions.length == 0) {
                directions = ["orthogonal"];
            }
            

            if (target in state.aggregatesDict) {
                logError('cannot assign sound events to aggregate objects (declared with "and"), only to regular objects, or properties, things defined in terms of "or" ("' + target + '").', lineNumber);
            } else if (target in state.objectMasks) {

            } else {
                //probably unreachable
                logError('Object "' + target + '" not found.', lineNumber);
            }

            var objectMask = state.objectMasks[target];

            var directionMask = 0;
            for (var j = 0; j < directions.length; j++) {
                directions[j] = directions[j].trim();
                var direction = directions[j];
                if (soundDirectionIndicators.indexOf(direction) === -1) {
                    //pre-emted by parser
                    logError('Was expecting a direction, instead found "' + direction + '".', lineNumber);
                } else {
                    var soundDirectionMask = soundDirectionIndicatorMasks[direction];
                    directionMask |= soundDirectionMask;
                }
            }


            var targets = [target];
            var modified = true;
            while (modified) {
                modified = false;
                for (var k = 0; k < targets.length; k++) {
                    var t = targets[k];
                    if (t in state.synonymsDict) {
                        targets[k] = state.synonymsDict[t];
                        modified = true;
                    } else if (t in state.propertiesDict) {
                        modified = true;
                        var props = state.propertiesDict[t];
                        targets.splice(k, 1);
                        k--;
                        for (var l = 0; l < props.length; l++) {
                            targets.push(props[l]);
                        }
                    }
                }
            }
            
            //if verb in soundverbs_directional
            if (verb === 'move' || verb === 'cantmove') {
                for (var j = 0; j < targets.length; j++) {
                    var targetName = targets[j];
                    var targetDat = state.objects[targetName];
                    var targetLayer = targetDat.layer;
                    var shiftedDirectionMask = new BitVec(STRIDE_MOV);
                    shiftedDirectionMask.ishiftor(directionMask, 5 * targetLayer);

                    var o = {
                        objectMask: objectMask,
                        directionMask: shiftedDirectionMask,
                        layer:targetLayer,
                        seed: seed
                    };

                    if (verb === 'move') {
                        sfx_MovementMasks[targetLayer].push(o);
                    } else {
                        sfx_MovementFailureMasks.push(o);
                    }
                }
            }



            var targetArray;
            switch (verb) {
                case "create":
                    {
                        var o = {
                            objectMask: objectMask,
                            seed: seed
                        }
                        sfx_CreationMasks.push(o);
                        break;
                    }
                case "destroy":
                    {
                        var o = {
                            objectMask: objectMask,
                            seed: seed
                        }
                        sfx_DestructionMasks.push(o);
                        break;
                    }
            }
        }
    }

    state.sfx_Events = sfx_Events;
    state.sfx_CreationMasks = sfx_CreationMasks;
    state.sfx_DestructionMasks = sfx_DestructionMasks;
    state.sfx_MovementMasks = sfx_MovementMasks;
    state.sfx_MovementFailureMasks = sfx_MovementFailureMasks;
}

var MAX_ERRORS = 5;

function loadFile(str) {
    var processor = new codeMirrorFn();
    var state = processor.startState();

    var lines = str.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        state.lineNumber = i + 1;
        var ss = new StringStream(line, 4);
        do {
            processor.token(ss, state);

            if (errorCount > MAX_ERRORS) {
                consolePrint("too many errors, aborting compilation");
                return;
            }
        }
        while (ss.eol() === false);
    }

    // delete state.lineNumber;

    generateExtraMembers(state);
    generateMasks(state);
    levelsToArray(state);
    rulesToArray(state);
    if (state.invalid>0){
        return null;
    }

    cacheAllRuleNames(state);

    removeDuplicateRules(state);

    rulesToMask(state);


    if (debugMode) {
        printRules(state);
    }

    arrangeRulesByGroupNumber(state);
    collapseRules(state.rules);
    collapseRules(state.lateRules);

    generateRigidGroupList(state);

    processWinConditions(state);
    checkObjectsAreLayered(state);

    twiddleMetaData(state);

    generateLoopPoints(state);

    generateSoundData(state);

    //delete intermediate representations
    delete state.commentLevel;
    delete state.line_should_end;
    delete state.line_should_end_because;
    delete state.sol_after_comment;
    delete state.names;
    delete state.abbrevNames;
    delete state.objects_candname;
    delete state.objects_section;
    delete state.objects_spritematrix;
    delete state.section;
    delete state.subsection;
    delete state.tokenIndex;
    delete state.current_line_wip_array;
    delete state.visitedSections;
    delete state.loops;
    /*
    var lines = stripComments(str);
    window.console.log(lines);
    var sections = generateSections(lines);
    window.console.log(sections);
    var sss = generateSemiStructuredSections(sections);*/
    return state;
}

var ifrm;
var errorCount;
var compiling;
var errorStrings;

function compile(text, levelIndex, randomseed) {
    matchCache = {};
    if (randomseed === undefined) {
        randomseed = null;
    }
    if(levelIndex === undefined){
        levelIndex = 0;
    }

    errorCount = 0;
    compiling = true;
    errorStrings = [];
    console.log('=================================');
    try {
        var state = loadFile(text);
    } catch(error){
        console.log(error);
    } finally {
        compiling = false;
    }

    if (state && state.levels && state.levels.length === 0) {
        logError('No levels found.  Add some levels!', undefined, true);
    }

    

    if (errorCount > 0) {
        consoleError('<span class="systemMessage">Errors detected during compilation; the game may not work correctly.</span>');
        if (errorCount > MAX_ERRORS) {
            return;
        }
    } else {
        var ruleCount = 0;
        for (var i = 0; i < state.rules.length; i++) {
            ruleCount += state.rules[i].length;
        }
        for (var i = 0; i < state.lateRules.length; i++) {
            ruleCount += state.lateRules[i].length;
        }
        console.log('Successful Compilation, generated ' + ruleCount + ' instructions.');
    }

    if (state!==null){//otherwise error
        setGameState(state, ["loadLevel", levelIndex], randomseed);
    }

    // clearInputHistory();

    // consoleCacheDump();

    // return state;
}

/*
..................................
.............SOKOBAN..............
..................................
...........#.new game.#...........
..................................
.............continue.............
..................................
arrow keys to move................
x to action.......................
z to undo, r to restart...........
*/


var RandomGen = new RNG();

var intro_template = [
	"..................................",
	"..................................",
	"..................................",
	"......Puzzle Script Terminal......",
	"..............v 1.7...............",
	"..................................",
	"..................................",
	"..................................",
	".........insert cartridge.........",
	"..................................",
	"..................................",
	"..................................",
	".................................."
];

var messagecontainer_template = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..........X to continue...........",
	"..................................",
	".................................."
];

var titletemplate_firstgo = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..........#.start game.#..........",
	"..................................",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select0 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"...........#.new game.#...........",
	"..................................",
	".............continue.............",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select1 = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"...........#.continue.#...........",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];


var titletemplate_firstgo_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"###########.start game.###########",
	"..................................",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select0_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"############.new game.############",
	"..................................",
	".............continue.............",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	".................................."];

var titletemplate_select1_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".............new game.............",
	"..................................",
	"############.continue.############",
	"..................................",
	".arrow keys to move...............",
	".X to action......................",
	".Z to undo, R to restart..........",
	"................................."];

var titleImage=[];
var titleWidth=titletemplate_select1[0].length;
var titleHeight=titletemplate_select1.length;
var textMode=true;
var titleScreen=true;
var titleMode=0;//1 means there are options
var titleSelection=0;
var titleSelected=false;

function showContinueOptionOnTitleScreen(){
	return (curlevel>0||curlevelTarget!==null)&&(curlevel in state.levels);
}

function unloadGame() {
	levelEditorOpened=false;
	state=introstate;
	level = new Level(0, 5, 5, 2, null);
	level.objects = new Int32Array(0);
	generateTitleScreen();
	canvasResize();
	redraw();
}

function generateTitleScreen()
{
	titleMode=showContinueOptionOnTitleScreen()?1:0;

	if (state.levels.length===0) {
		titleImage=intro_template;
		return;
	}

	var title = "PuzzleScript Game";
	if (state.metadata.title!==undefined) {
		title=state.metadata.title;
	}

	if (titleMode===0) {
		if (titleSelected) {
			titleImage = deepClone(titletemplate_firstgo_selected);		
		} else {
			titleImage = deepClone(titletemplate_firstgo);					
		}
	} else {
		if (titleSelection===0) {
			if (titleSelected) {
				titleImage = deepClone(titletemplate_select0_selected);		
			} else {
				titleImage = deepClone(titletemplate_select0);					
			}			
		} else {
			if (titleSelected) {
				titleImage = deepClone(titletemplate_select1_selected);		
			} else {
				titleImage = deepClone(titletemplate_select1);					
			}						
		}
	}

	var noAction = 'noaction' in state.metadata;	
	var noUndo = 'noundo' in state.metadata;
	var noRestart = 'norestart' in state.metadata;
	if (noUndo && noRestart) {
		titleImage[11]="..............................................";
	} else if (noUndo) {
		titleImage[11]=".......R to restart...........................";
	} else if (noRestart) {
		titleImage[11]=".Z to undo.....................";
	}
	if (noAction) {
		titleImage[10]=".......X to select............................";
	}
	for (var i=0;i<titleImage.length;i++)
	{
		titleImage[i]=titleImage[i].replace(/\./g, ' ');
	}

	var width = titleImage[0].length;
	var titlelines=wordwrap(title,titleImage[0].length);
	if (state.metadata.author!==undefined){
		if ( titlelines.length>3){
			titlelines.splice(3);
			logWarning("Game title is too long to fit on screen, truncating to three lines.",state.metadata_lines.title,true);
		}
	} else {
		if ( titlelines.length>5){
			titlelines.splice(5);
			logWarning("Game title is too long to fit on screen, truncating to five lines.",state.metadata_lines.title,true);
		}

	}
	for (var i=0;i<titlelines.length;i++) {
		var titleline=titlelines[i];
		var titleLength=titleline.length;
		var lmargin = ((width-titleLength)/2)|0;
		var rmargin = width-titleLength-lmargin;
		var row = titleImage[1+i];
		titleImage[1+i]=row.slice(0,lmargin)+titleline+row.slice(lmargin+titleline.length);
	}
	if (state.metadata.author!==undefined) {
		var attribution="by "+state.metadata.author;
		var attributionsplit = wordwrap(attribution,titleImage[0].length);
		if (attributionsplit[0].length<titleImage[0].length){
			attributionsplit[0]=" "+attributionsplit[0];
		}
		if (attributionsplit.length>3){
			attributionsplit.splice(3);
			logWarning("Author list too long to fit on screen, truncating to three lines.",state.metadata_lines.author,true);
		}
		for (var i=0;i<attributionsplit.length;i++) {
			var line = attributionsplit[i]+" ";
			if (line.length>width){
				line=line.slice(0,width);
			}
			var row = titleImage[3+i];
			titleImage[3+i]=row.slice(0,width-line.length)+line;
		}
	}

}

var introstate = {
	title: "EMPTY GAME",
	attribution: "increpare",
   	objectCount: 2,
   	metadata:[],
   	levels:[],
   	bgcolor:"#000000",
   	fgcolor:"#FFFFFF"
};

var state = introstate;

function deepClone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = deepClone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = deepClone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
/*                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else */{
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

function wordwrap( str, width ) {
 
    width = width || 75;
    var cut = true;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
 
    return str.match( RegExp(regex, 'g') );
 
}

var splitMessage=[];

function drawMessageScreen() {
	titleMode=0;
	textMode=true;
	titleImage = deepClone(messagecontainer_template);

	for (var i=0;i<titleImage.length;i++)
	{
		titleImage[i]=titleImage[i].replace(/\./g, ' ');
	}

	var emptyLineStr = titleImage[9];
	var xToContinueStr = titleImage[10];

	titleImage[10]=emptyLineStr;

	var width = titleImage[0].length;

	var message;
	if (messagetext==="") {
		var leveldat = state.levels[curlevel];
		message = leveldat.message.trim();
	} else {
		message = messagetext;
	}
	
	splitMessage = wordwrap(message,titleImage[0].length);


	var offset = 5-((splitMessage.length/2)|0);
	if (offset<0){
		offset=0;
	}

	var count = Math.min(splitMessage.length,12);
	for (var i=0;i<count;i++) {
		var m = splitMessage[i];
		var row = offset+i;	
		var messageLength=m.length;
		var lmargin = ((width-messageLength)/2)|0;
		var rmargin = width-messageLength-lmargin;
		var rowtext = titleImage[row];
		titleImage[row]=rowtext.slice(0,lmargin)+m+rowtext.slice(lmargin+m.length);		
	}

	var endPos = 10;
	if (count>=10) {
		if (count<12){
			endPos = count + 1;
		} else {
			endPos = 12;
		}
        }
	if (quittingMessageScreen) {
		titleImage[endPos]=emptyLineStr;
	} else {
		titleImage[endPos]=xToContinueStr;
	}
	
	canvasResize();
}

var loadedLevelSeed=0;

function loadLevelFromLevelDat(state,leveldat,randomseed,clearinputhistory) {	
	if (randomseed==null) {
		randomseed = (Math.random() + Date.now()).toString();
	}
	loadedLevelSeed = randomseed;
	RandomGen = new RNG(loadedLevelSeed);
	// forceRegenImages=true;
	ignoreNotJustPressedAction=true;
	titleScreen=false;
	titleMode=showContinueOptionOnTitleScreen()?1:0;
	titleSelection=showContinueOptionOnTitleScreen()?1:0;
	titleSelected=false;
    againing=false;
    if (leveldat===undefined) {
    	consolePrint("Trying to access a level that doesn't exist.",true);
	goToTitleScreen();
    	return;
    }
    if (leveldat.message===undefined) {
    	titleMode=0;
    	textMode=false;
		level = leveldat.clone();
		RebuildLevelArrays();


        if (state!==undefined) {
	        if (state.metadata.flickscreen!==undefined){
	            oldflickscreendat=[
	            	0,
	            	0,
	            	Math.min(state.metadata.flickscreen[0],level.width),
	            	Math.min(state.metadata.flickscreen[1],level.height)
	            ];
	        } else if (state.metadata.zoomscreen!==undefined){
	            oldflickscreendat=[
	            	0,
	            	0,
	            	Math.min(state.metadata.zoomscreen[0],level.width),
	            	Math.min(state.metadata.zoomscreen[1],level.height)
	            ];
	        }
        }

	    backups=[]
	    restartTarget=backupLevel();
		keybuffer=[];

	    if ('run_rules_on_level_start' in state.metadata) {
			runrulesonlevelstart_phase=true;
			processInput(-1,true);
			runrulesonlevelstart_phase=false;
	    }
	} else {
		ignoreNotJustPressedAction=true;
		tryPlayShowMessageSound();
		drawMessageScreen();
    	canvasResize();
	}

	// if (clearinputhistory===true){
	// 	clearInputHistory();
	// }
}

function loadLevelFromStateTarget(state,levelindex,target,randomseed) {	
    var leveldat = target;    
	curlevel=levelindex;
	curlevelTarget=target;
    if (leveldat.message===undefined) {
	    if (levelindex=== 0){ 
			tryPlayStartLevelSound();
		} else {
			tryPlayStartLevelSound();			
		}
    }
    loadLevelFromLevelDat(state,state.levels[levelindex],randomseed);
    restoreLevel(target);
    restartTarget=target;
}

function loadLevelFromState(state,levelindex,randomseed) {	
    var leveldat = state.levels[levelindex];    
	curlevel=levelindex;
	curlevelTarget=null;
    if (leveldat!==undefined && leveldat.message===undefined) {
	    if (levelindex=== 0){ 
			tryPlayStartLevelSound();
		} else {
			tryPlayStartLevelSound();			
		}
    }
    loadLevelFromLevelDat(state,leveldat,randomseed);
}

var sprites = [
{
    color: '#423563',
    dat: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ]
},
{
    color: '#252342',
    dat: [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 1, 0]
    ]
}
];

function tryPlaySimpleSound(soundname) {
	if (state.sfx_Events[soundname]!==undefined) {
		var seed = state.sfx_Events[soundname];
		playSound(seed,true);
	}
}
function tryPlayTitleSound() {
	tryPlaySimpleSound("titlescreen");
}

function tryPlayEndGameSound() {
	tryPlaySimpleSound("endgame");
}

function tryPlayCancelSound() {
	tryPlaySimpleSound("cancel");
}

function tryPlayStartLevelSound() {
	tryPlaySimpleSound("startlevel");
}

function tryPlayEndLevelSound() {
	tryPlaySimpleSound("endlevel");
}

function tryPlayUndoSound(){
	tryPlaySimpleSound("undo");
}

function tryPlayRestartSound(){
	tryPlaySimpleSound("restart");
}

function tryPlayShowMessageSound(){
	tryPlaySimpleSound("showmessage");
}

var backups=[];
var restartTarget;

function backupLevel() {
	var ret = {
		dat : new Int32Array(level.objects),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([])
	};
	return ret;
}

function level4Serialization() {
	var ret = {
		dat : Array.from(level.objects),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([])
	};
	return ret;
}



function setGameState(_state, command, randomseed) {
	oldflickscreendat=[];
	timer=0;
	autotick=0;
	winning=false;
	againing=false;
    messageselected=false;
    STRIDE_MOV=_state.STRIDE_MOV;
    STRIDE_OBJ=_state.STRIDE_OBJ;
    
    sfxCreateMask=new BitVec(STRIDE_OBJ);
    sfxDestroyMask=new BitVec(STRIDE_OBJ);

	if (command===undefined) {
		command=["restart"];
	}
	if ((state.levels.length===0 || _state.levels.length===0) && command.length>0 && command[0]==="rebuild")  {
		command=["restart"];
	}
	if (randomseed===undefined) {
		randomseed=null;
	}
	RandomGen = new RNG(randomseed);

	state = _state;

    if (command[0]!=="rebuild"){
    	backups=[];
    }
    //set sprites
    sprites = [];
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var object = state.objects[n];
            var sprite = {
                colors: object.colors,
                dat: object.spritematrix
            };
            sprites[object.id] = sprite;
        }
    }
    if (state.metadata.realtime_interval!==undefined) {
    	autotick=0;
    	autotickinterval=state.metadata.realtime_interval*1000;
    } else {
    	autotick=0;
    	autotickinterval=0;
    }

    if (state.metadata.key_repeat_interval!==undefined) {
		repeatinterval=state.metadata.key_repeat_interval*1000;
    } else {
    	repeatinterval=150;
    }

    if (state.metadata.again_interval!==undefined) {
		againinterval=state.metadata.again_interval*1000;
    } else {
    	againinterval=150;
    }
    if (throttle_movement && autotickinterval===0) {
    	logWarning("throttle_movement is designed for use in conjunction with realtime_interval. Using it in other situations makes games gross and unresponsive, broadly speaking.  Please don't.");
    }
    norepeat_action = state.metadata.norepeat_action!==undefined;
    
    switch(command[0]){
    	case "restart":
    	{
		    winning=false;
		    timer=0;
		    titleScreen=true;
		    tryPlayTitleSound();
		    textMode=true;
		    titleSelection=showContinueOptionOnTitleScreen()?1:0;
		    titleSelected=false;
		    quittingMessageScreen=false;
		    quittingTitleScreen=false;
		    messageselected=false;
		    titleMode = 0;
		    if (showContinueOptionOnTitleScreen()) {
		    	titleMode=1;
		    }
		    generateTitleScreen();
		    break;
		}
		case "rebuild":
		{
			//do nothing
			break;
		}
		case "loadFirstNonMessageLevel":{
			for (var i=0;i<state.levels.length;i++){
				if (state.levels[i].hasOwnProperty("message")){
					continue;
				}
				var targetLevel = i;
				curlevel=targetLevel;
				curlevelTarget=null;
			    winning=false;
			    timer=0;
			    titleScreen=false;
			    textMode=false;
			    titleSelection=showContinueOptionOnTitleScreen()?1:0;
			    titleSelected=false;
			    quittingMessageScreen=false;
			    quittingTitleScreen=false;
			    messageselected=false;
			    titleMode = 0;
				loadLevelFromState(state,targetLevel,randomseed);
				break;
			}
			break;	
		}
		case "loadLevel":
		{
			var targetLevel = command[1];
			curlevel=targetLevel;
			curlevelTarget=null;
		    winning=false;
		    timer=0;
		    titleScreen=false;
		    textMode=false;
		    titleSelection=showContinueOptionOnTitleScreen()?1:0;
		    titleSelected=false;
		    quittingMessageScreen=false;
		    quittingTitleScreen=false;
		    messageselected=false;
		    titleMode = 0;
			loadLevelFromState(state,targetLevel,randomseed);
			break;
		}
		case "levelline":
		{
			var targetLine = command[1];
			for (var i=state.levels.length-1;i>=0;i--) {
				var level= state.levels[i];
				if(level.lineNumber<=targetLine+1) {
					curlevel=i;
					curlevelTarget=null;
				    winning=false;
				    timer=0;
				    titleScreen=false;
				    textMode=false;
				    titleSelection=showContinueOptionOnTitleScreen()?1:0;
				    titleSelected=false;
				    quittingMessageScreen=false;
				    quittingTitleScreen=false;
				    messageselected=false;
				    titleMode = 0;
					loadLevelFromState(state,i);
					break;
				}
			}
			break;
		}
	}
	
	// if(command[0] !== "rebuild") {
		// clearInputHistory();
	// }
	// canvasResize();


	// if (state.sounds.length==0){
	// 	killAudioButton();
	// } else {
	// 	showAudioButton();
	// }
	
}

function RebuildLevelArrays() {
	level.movements = new Int32Array(level.n_tiles * STRIDE_MOV);

    level.rigidMovementAppliedMask = [];
    level.rigidGroupIndexMask = [];
	level.rowCellContents = [];
	level.rowCellContents_Movements = [];
	level.colCellContents = [];
	level.colCellContents_Movements = [];
	level.mapCellContents = new BitVec(STRIDE_OBJ);
	level.mapCellContents_Movements = new BitVec(STRIDE_MOV);

	//I have these to avoid dynamic allocation - I generate 3 because why not, 
	//but according to my tests I never seem to call this while a previous copy is still in scope
	_movementVecs = [new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV)];
	_rigidVecs = [new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV)];

	_o1 = new BitVec(STRIDE_OBJ);
	_o2 = new BitVec(STRIDE_OBJ);
	_o2_5 = new BitVec(STRIDE_OBJ);
	_o3 = new BitVec(STRIDE_OBJ);
	_o4 = new BitVec(STRIDE_OBJ);
	_o5 = new BitVec(STRIDE_OBJ);
	_o6 = new BitVec(STRIDE_OBJ);
	_o7 = new BitVec(STRIDE_OBJ);
	_o8 = new BitVec(STRIDE_OBJ);
	_o9 = new BitVec(STRIDE_OBJ);
	_o10 = new BitVec(STRIDE_OBJ);
	_o11 = new BitVec(STRIDE_OBJ);
	_o12 = new BitVec(STRIDE_OBJ);
	_m1 = new BitVec(STRIDE_MOV);
	_m2 = new BitVec(STRIDE_MOV);
	_m3 = new BitVec(STRIDE_MOV);
	

    for (var i=0;i<level.height;i++) {
    	level.rowCellContents[i]=new BitVec(STRIDE_OBJ);	    	
    }
    for (var i=0;i<level.width;i++) {
    	level.colCellContents[i]=new BitVec(STRIDE_OBJ);	    	
    }

    for (var i=0;i<level.height;i++) {
    	level.rowCellContents_Movements[i]=new BitVec(STRIDE_MOV);	    	
    }
    for (var i=0;i<level.width;i++) {
    	level.colCellContents_Movements[i]=new BitVec(STRIDE_MOV);	    	
    }

    for (var i=0;i<level.n_tiles;i++)
    {
        level.rigidMovementAppliedMask[i]=new BitVec(STRIDE_MOV);
        level.rigidGroupIndexMask[i]=new BitVec(STRIDE_MOV);
    }
}

var messagetext="";

function applyDiff(diff, level_objects) {

	var index=0;
	
	while (index<diff.dat.length){
		var start_index = diff.dat[index];
		var copy_length = diff.dat[index+1];
		if (copy_length===0){
			break;//tail of buffer is all 0s
		}
		for (var j=0;j<copy_length;j++){
			level_objects[start_index+j]=diff.dat[index+2+j];
		}
		index += 2 + copy_length;
	}
}

function unconsolidateDiff(before,after) {

	// If before is not a diff, return it, otherwise generate a complete 'before' 
	// state from the 'after' state and the 'diff' (remember, the diffs are all 
	// backwards...).
	if (!before.hasOwnProperty("diff")) {
		return before;
	}

	var after_objects = new Int32Array(after.dat);
	applyDiff(before, after_objects);

	return {
		dat: after_objects,
		width: before.width,
		height: before.height,
		oldflickscreendat: before.oldflickscreendat
	}
}

function restoreLevel(lev) {
	var diffing = lev.hasOwnProperty("diff");

	oldflickscreendat=lev.oldflickscreendat.concat([]);

	if (diffing){
		applyDiff(lev, level.objects);
	} else {	
		level.objects = new Int32Array(lev.dat);
	}

	if (level.width !== lev.width || level.height !== lev.height) {
		level.width = lev.width;
		level.height = lev.height;
		level.n_tiles = lev.width * lev.height;
		RebuildLevelArrays();
		//regenerate all other stride-related stuff
	}
	else 
	{
	// layercount doesn't change

		for (var i=0;i<level.n_tiles;i++) {
			level.movements[i]=0;
			level.rigidMovementAppliedMask[i].setZero();
			level.rigidGroupIndexMask[i].setZero();
		}	

	    for (var i=0;i<level.height;i++) {
	    	var rcc = level.rowCellContents[i];
	    	rcc.setZero();
	    }
	    for (var i=0;i<level.width;i++) {
	    	var ccc = level.colCellContents[i];
	    	ccc.setZero();
	    }
	}

    againing=false;
    winning=false;
    level.commandQueue=[];
    level.commandQueueSourceRules=[];
}

var zoomscreen=false;
var flickscreen=false;
var screenwidth=0;
var screenheight=0;

//compresses 'before' into diff
function consolidateDiff(before,after){
	if (before.width !== after.width || before.height!==after.height || before.dat.length!==after.dat.length){
		return before;
	}
	if (before.hasOwnProperty("diff")||after.hasOwnProperty("diff")){
		return before;
	}
	//only generate diffs if level size is bigger than this
	if (before.dat.length<1024){
		return before;
	}
	//diff structure: repeating ( start,length, [ data ] )
	var result = new Int32Array(128);
	var position=0;
	var chain=false;
	var chain_start_idx_in_diff=-1;
	var before_dat = before.dat;
	var after_dat = after.dat;
	for (var i=0;i<before_dat.length;i++){
		if (chain===false){
			if (before_dat[i]!==after_dat[i]){
				chain=true;
				chain_start_idx_in_diff = position;

				if (result.length<position+4){
					var doubled = new Int32Array(2*result.length);
					doubled.set(result);
					result = doubled;
				}

				result[position+0]=i;
				result[position+1]=1;
				result[position+2]=before_dat[i];
				position+=3;
			}
		} else {
			if (before_dat[i]!==after_dat[i]){
				
				if (position+1>=result.length){
					if (result.length<position+4){
						var doubled = new Int32Array(2*result.length);
						doubled.set(result);
						result = doubled;
					}	
				}
				result[chain_start_idx_in_diff+1]++;
				result[position]=before_dat[i];
				position++;
			} else {
				chain=false;
			}
		}
	}
	return {		
		diff : true,
		dat : result,
		width : before.width,
		height : before.height,
		oldflickscreendat: before.oldflickscreendat
	}
}

function addUndoState(state){
	backups.push(state);
	if(backups.length>2 && !backups[backups.length-1].hasOwnProperty("diff")){
		backups[backups.length-3]=consolidateDiff(backups[backups.length-3],backups[backups.length-2]);
	}
}

function DoRestart(force) {
	if (restarting===true){
		return;
	}
	if (force!==true && ('norestart' in state.metadata)) {
		return;
	}
	restarting=true;
	if (force!==true) {
		addUndoState(backupLevel());
	}

	if (verbose_logging) {
		consolePrint("--- restarting ---",true);
	}

	restoreLevel(restartTarget);
	tryPlayRestartSound();

	if ('run_rules_on_level_start' in state.metadata) {
    	processInput(-1,true);
	}
	
	level.commandQueue=[];
	level.commandQueueSourceRules=[];
	restarting=false;
}

function backupDiffers(){
	if (backups.length==0){
		return true;
	}
	var bak = backups[backups.length-1];

	if (bak.hasOwnProperty("diff")){
		return bak.dat.length!==0 && bak.dat[1]!==0;//if it's empty or if it's all 0s
	} else {
		for (var i=0;i<level.objects.length;i++) {
			if (level.objects[i]!==bak.dat[i]) {
				return true;
			}
		}
		return false;
	}
}

function DoUndo(force,ignoreDuplicates) {
	if ((!levelEditorOpened)&&('noundo' in state.metadata && force!==true)) {
		return;
	}
	if (verbose_logging) {
		consolePrint("--- undoing ---",true);
	}

	if (ignoreDuplicates){
		while (backupDiffers()==false){
			backups.pop();
		}
	}

	if (backups.length>0) {
		var torestore = backups[backups.length-1];
		restoreLevel(torestore);
		backups = backups.splice(0,backups.length-1);
		if (! force) {
			tryPlayUndoSound();
		}
	}
}

function getPlayerPositions() {
    var result=[];
    var playerMask = state.playerMask;
    for (var i=0;i<level.n_tiles;i++) {
        level.getCellInto(i,_o11);
        if (playerMask.anyBitsInCommon(_o11)) {
            result.push(i);
        }
    }
    return result;
}

function getLayersOfMask(cellMask) {
    var layers=[];
    for (var i=0;i<state.objectCount;i++) {
        if (cellMask.get(i)) {
            var n = state.idDict[i];
            var o = state.objects[n];
            layers.push(o.layer)
        }
    }
    return layers;
}

function moveEntitiesAtIndex(positionIndex, entityMask, dirMask) {
    var cellMask = level.getCell(positionIndex);
    cellMask.iand(entityMask);
    var layers = getLayersOfMask(cellMask);

    var movementMask = level.getMovements(positionIndex);
    for (var i=0;i<layers.length;i++) {
    	movementMask.ishiftor(dirMask, 5 * layers[i]);
    }
    level.setMovements(positionIndex, movementMask);

	var colIndex=(positionIndex/level.height)|0;
	var rowIndex=(positionIndex%level.height);
	level.colCellContents_Movements[colIndex].ior(movementMask);
	level.rowCellContents_Movements[rowIndex].ior(movementMask);
	level.mapCellContents_Movements.ior(movementMask);
}


function startMovement(dir) {
	var movedany=false;
    var playerPositions = getPlayerPositions();
    for (var i=0;i<playerPositions.length;i++) {
        var playerPosIndex = playerPositions[i];
        moveEntitiesAtIndex(playerPosIndex,state.playerMask,dir);
    }
    return playerPositions;
}

var dirMasksDelta = {
     1:[0,-1],//up
     2:[0,1],//'down'  : 
     4:[-1,0],//'left'  : 
     8:[1,0],//'right' : 
     15:[0,0],//'?' : 
     16:[0,0],//'action' : 
     3:[0,0]//'no'
};

var dirMaskName = {
     1:'up',
     2:'down'  ,
     4:'left'  , 
     8:'right',  
     15:'?' ,
     16:'action',
     3:'no'
};

var seedsToPlay_CanMove=[];
var seedsToPlay_CantMove=[];

function repositionEntitiesOnLayer(positionIndex,layer,dirMask) 
{
    var delta = dirMasksDelta[dirMask];

    var dx = delta[0];
    var dy = delta[1];
    var tx = ((positionIndex/level.height)|0);
    var ty = ((positionIndex%level.height));
    var maxx = level.width-1;
    var maxy = level.height-1;

    if ( (tx===0&&dx<0) || (tx===maxx&&dx>0) || (ty===0&&dy<0) || (ty===maxy&&dy>0)) {
    	return false;
    }

    var targetIndex = (positionIndex+delta[1]+delta[0]*level.height);

    var layerMask = state.layerMasks[layer];
    var targetMask = level.getCellInto(targetIndex,_o7);
    var sourceMask = level.getCellInto(positionIndex,_o8);

    if (layerMask.anyBitsInCommon(targetMask) && (dirMask!=16)) {
        return false;
    }

	for (var i=0;i<state.sfx_MovementMasks[layer].length;i++) {
		var o = state.sfx_MovementMasks[layer][i];
		var objectMask = o.objectMask;
		if (objectMask.anyBitsInCommon(sourceMask)) {
			var movementMask = level.getMovements(positionIndex);
			var directionMask = o.directionMask;
			if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CanMove.indexOf(o.seed)===-1) {
				seedsToPlay_CanMove.push(o.seed);
			}
		}
	}

    var movingEntities = sourceMask.clone();
    sourceMask.iclear(layerMask);
    movingEntities.iand(layerMask);
    targetMask.ior(movingEntities);

    level.setCell(positionIndex, sourceMask);
    level.setCell(targetIndex, targetMask);
	
    var colIndex=(targetIndex/level.height)|0;
	var rowIndex=(targetIndex%level.height);
	
    level.colCellContents[colIndex].ior(movingEntities);
    level.rowCellContents[rowIndex].ior(movingEntities);
	//corresponding movement stuff in setmovements
    return true;
}

function repositionEntitiesAtCell(positionIndex) {
    var movementMask = level.getMovements(positionIndex);
    if (movementMask.iszero())
        return false;

    var moved=false;
    for (var layer=0;layer<level.layerCount;layer++) {
        var layerMovement = movementMask.getshiftor(0x1f, 5*layer);
        if (layerMovement!==0) {
            var thismoved = repositionEntitiesOnLayer(positionIndex,layer,layerMovement);
            if (thismoved) {
                movementMask.ishiftclear(layerMovement, 5*layer);
                moved = true;
            }
        }
    }

   	level.setMovements(positionIndex, movementMask);

    return moved;
}


function Level(lineNumber, width, height, layerCount, objects) {
	this.lineNumber = lineNumber;
	this.width = width;
	this.height = height;
	this.n_tiles = width * height;
	this.objects = objects;
	this.layerCount = layerCount;
	this.commandQueue = [];
	this.commandQueueSourceRules = [];
}

Level.prototype.delta_index = function(direction)
{
	const [dx, dy] = dirMasksDelta[direction]
	return dx*this.height + dy
}

Level.prototype.clone = function() {
	var clone = new Level(this.lineNumber, this.width, this.height, this.layerCount, null);
	clone.objects = new Int32Array(this.objects);
	return clone;
}

Level.prototype.getCell = function(index) {
	return new BitVec(this.objects.subarray(index * STRIDE_OBJ, index * STRIDE_OBJ + STRIDE_OBJ));
}

Level.prototype.getCellInto = function(index,targetarray) {
	for (var i=0;i<STRIDE_OBJ;i++) {
		targetarray.data[i]=this.objects[index*STRIDE_OBJ+i];	
	}
	return targetarray;
}

Level.prototype.setCell = function(index, vec) {
	for (var i = 0; i < vec.data.length; ++i) {
		this.objects[index * STRIDE_OBJ + i] = vec.data[i];
	}
}

var _movementVecs;
var _rigidVecs;
var _movementVecIndex=0;
Level.prototype.getMovements = function(index) {
	var _movementsVec=_movementVecs[_movementVecIndex];
	_movementVecIndex=(_movementVecIndex+1)%_movementVecs.length;

	for (var i=0;i<STRIDE_MOV;i++) {
		_movementsVec.data[i]= this.movements[index*STRIDE_MOV+i];	
	}
	return _movementsVec;
}

Level.prototype.getRigids = function(index) {
	return this.rigidMovementAppliedMask[index].clone();
}

Level.prototype.getMovementsInto = function(index,targetarray) {
	var _movementsVec=targetarray;

	for (var i=0;i<STRIDE_MOV;i++) {
		_movementsVec.data[i]=this.movements[index*STRIDE_MOV+i];	
	}
	return _movementsVec;
}

Level.prototype.setMovements = function(index, vec) {
	for (var i = 0; i < vec.data.length; ++i) {
		this.movements[index * STRIDE_MOV + i] = vec.data[i];
	}

	var targetIndex = index*STRIDE_MOV + i;
		
	//corresponding object stuff in repositionEntitiesOnLayer
	var colIndex=(index/this.height)|0;
	var rowIndex=(index%this.height);
	level.colCellContents_Movements[colIndex].ior(vec);
	level.rowCellContents_Movements[rowIndex].ior(vec);
	level.mapCellContents_Movements.ior(vec);


}

var ellipsisPattern = ['ellipsis'];

function BitVec(init) {
	this.data = new Int32Array(init);
	return this;
}

BitVec.prototype.cloneInto = function(target) {
	for (var i=0;i<this.data.length;++i) {
		target.data[i]=this.data[i];
	}
	return target;
}
BitVec.prototype.clone = function() {
	return new BitVec(this.data);
}

BitVec.prototype.iand = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] &= other.data[i];
	}
}


BitVec.prototype.inot = function() {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] = ~this.data[i];
	}
}

BitVec.prototype.ior = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] |= other.data[i];
	}
}

BitVec.prototype.iclear = function(other) {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] &= ~other.data[i];
	}
}

BitVec.prototype.ibitset = function(ind) {
	this.data[ind>>5] |= 1 << (ind & 31);
}

BitVec.prototype.ibitclear = function(ind) {
	this.data[ind>>5] &= ~(1 << (ind & 31));
}

BitVec.prototype.get = function(ind) {
	return (this.data[ind>>5] & 1 << (ind & 31)) !== 0;
}

BitVec.prototype.getshiftor = function(mask, shift) {
	var toshift = shift & 31;
	var ret = this.data[shift>>5] >>> (toshift);
	if (toshift) {
		ret |= this.data[(shift>>5)+1] << (32 - toshift);
	}
	return ret & mask;
}

BitVec.prototype.ishiftor = function(mask, shift) {
	var toshift = shift&31;
	var low = mask << toshift;
	this.data[shift>>5] |= low;
	if (toshift) {
		var high = mask >> (32 - toshift);
		this.data[(shift>>5)+1] |= high;
	}
}

BitVec.prototype.ishiftclear = function(mask, shift) {
	var toshift = shift & 31;
	var low = mask << toshift;
	this.data[shift>>5] &= ~low;
	if (toshift){
		var high = mask >> (32 - (shift & 31));
		this.data[(shift>>5)+1] &= ~high;
	}
}

BitVec.prototype.equals = function(other) {
	if (this.data.length !== other.data.length)
		return false;
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i] !== other.data[i])
			return false;
	}
	return true;
}

BitVec.prototype.setZero = function() {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i]=0;
	}
}

BitVec.prototype.iszero = function() {
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i])
			return false;
	}
	return true;
}

BitVec.prototype.bitsSetInArray = function(arr) {
	for (var i = 0; i < this.data.length; ++i) {
		if ((this.data[i] & arr[i]) !== this.data[i]) {
			return false;
		}
	}
	return true;
}

BitVec.prototype.bitsClearInArray = function(arr) {
	for (var i = 0; i < this.data.length; ++i) {
		if (this.data[i] & arr[i]) {
			return false;
		}
	}
	return true;
}

BitVec.prototype.anyBitsInCommon = function(other) {
	return !this.bitsClearInArray(other.data);
}

function Rule(rule) {
	this.direction = rule[0]; 		/* direction rule scans in */
	this.patterns = rule[1];		/* lists of CellPatterns to match */
	this.hasReplacements = rule[2];
	this.lineNumber = rule[3];		/* rule source for debugging */
	this.ellipsisCount = rule[4];		/* number of ellipses present */
	this.groupNumber = rule[5];		/* execution group number of rule */
	this.isRigid = rule[6];
	this.commands = rule[7];		/* cancel, restart, sfx, etc */
	this.isRandom = rule[8];
	this.cellRowMasks = rule[9];
	this.cellRowMasks_Movements = rule[10];
	this.ruleMask = this.cellRowMasks.reduce( (acc, m) => { acc.ior(m); return acc }, new BitVec(STRIDE_OBJ) );

	/*I tried out doing a ruleMask_movements as well along the lines of the above,
	but it didn't help at all - I guess because almost every tick there are movements 
	somewhere on the board - move filtering works well at a row/col level, but is pretty 
	useless (or worse than useless) on a boardwide level*/

	this.cellRowMatches = [];
	for (var i=0;i<this.patterns.length;i++) {
		this.cellRowMatches.push(this.generateCellRowMatchesFunction(this.patterns[i],this.ellipsisCount[i]));
	}
	/* TODO: eliminate isRigid, groupNumber, isRandom
	from this class by moving them up into a RuleGroup class */
}


Rule.prototype.generateCellRowMatchesFunction = function(cellRow,ellipsisCount)  {
	if (ellipsisCount===0) {
		var cr_l = cellRow.length;

		/*
		hard substitute in the first one - if I substitute in all of them, firefox chokes.
		*/
		var fn = "";
		var mul = STRIDE_OBJ === 1 ? '' : '*'+STRIDE_OBJ;	
		for (var i = 0; i < STRIDE_OBJ; ++i) {
			fn += 'var cellObjects' + i + ' = objects[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		mul = STRIDE_MOV === 1 ? '' : '*'+STRIDE_MOV;
		for (var i = 0; i < STRIDE_MOV; ++i) {
			fn += 'var cellMovements' + i + ' = movements[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		fn += "return "+cellRow[0].generateMatchString('0_');// cellRow[0].matches(i)";
		for (var cellIndex=1;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(i+"+cellIndex+"*d, objects, movements)";
		}
		fn+=";";

		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("cellRow","i", 'd', 'objects', 'movements',fn);
	} else if (ellipsisCount===1){
		var cr_l = cellRow.length;

		var fn = "var result = [];\n"
		fn += "if(cellRow[0].matches(i, objects, movements)";
		var cellIndex=1;
		for (;cellRow[cellIndex]!==ellipsisPattern;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(i+"+cellIndex+"*d, objects, movements)";
		}
		cellIndex++;
		fn+=") {\n";
		fn+="\tfor (var k=kmin;k<kmax;k++) {\n"
		fn+="\t\tif(cellRow["+cellIndex+"].matches((i+d*(k+"+(cellIndex-1)+")), objects, movements)";
		cellIndex++;
		for (;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches((i+d*(k+"+(cellIndex-1)+")), objects, movements)";			
		}
		fn+="){\n";
		fn+="\t\t\tresult.push([i,k]);\n";
		fn+="\t\t}\n"
		fn+="\t}\n";				
		fn+="}\n";		
		fn+="return result;"


		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("cellRow","i","kmax","kmin", 'd', "objects", "movements",fn);
	} else { //ellipsisCount===2
		var cr_l = cellRow.length;

		var ellipsis_index_1=-1;
		var ellipsis_index_2=-1;
		for (var cellIndex=0;cellIndex<cr_l;cellIndex++) {
			if (cellRow[cellIndex]===ellipsisPattern) {
				if (ellipsis_index_1===-1) {
					ellipsis_index_1=cellIndex;
				} else {
					ellipsis_index_2=cellIndex;
					break;
				}
			}
		}

		var fn = "var result = [];\n"
		fn += "if(cellRow[0].matches(i, objects, movements)";

		for (var idx=1;idx<ellipsis_index_1;idx++) {
			fn+="&&cellRow["+idx+"].matches(i+"+idx+"*d, objects, movements)";
		}
		fn+=") {\n";

		//try match middle part
		fn+="	for (var k1=k1min;k1<k1max;k1++) {\n"
		fn+="		if(cellRow["+(ellipsis_index_1+1)+"].matches((i+d*(k1+"+(ellipsis_index_1+1-1)+")), objects, movements)";
		for (var idx=ellipsis_index_1+2;idx<ellipsis_index_2;idx++) {
			fn+="&&cellRow["+idx+"].matches((i+d*(k1+"+(idx-1)+")), objects, movements)";			
		}
		fn+="		){\n";
		//try match right part

		fn+="			for (var k2=k2min;k1+k2<kmax && k2<k2max;k2++) {\n"
		fn+="				if(cellRow["+(ellipsis_index_2+1)+"].matches((i+d*(k1+k2+"+(ellipsis_index_2+1-2)+")), objects, movements)";
		for (var idx=ellipsis_index_2+2;idx<cr_l;idx++) {
			fn+="&&cellRow["+idx+"].matches((i+d*(k1+k2+"+(idx-2)+")), objects, movements)";			
		}
		fn+="				){\n";
		fn+="					result.push([i,k1,k2]);\n";
		fn+="				}\n"
		fn+="			}\n"
		fn+="		}\n"
		fn+="	}\n";				
		fn+="}\n";		
		fn+="return result;"


		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("cellRow","i","kmax","kmin", "k1max","k1min","k2max","k2min", 'd', "objects", "movements",fn);

	}
//say cellRow has length 3, with a split in the middle
/*
function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {

	var result = [];
	var matchfirsthalf = cellRow[0].matches(i);
	if (matchfirsthalf) {
		for (var k=mink;k<maxk;k++) {
			if (cellRow[2].matches((i+d*(k+0)))) {
				result.push([i,k]);
			}
		}
	}
	return result;
}
*/
	

}


var STRIDE_OBJ = 1;
var STRIDE_MOV = 1;

function CellPattern(row) {
	this.objectsPresent = row[0];
	this.objectsMissing = row[1];
	this.anyObjectsPresent = row[2];
	this.movementsPresent = row[3];
	this.movementsMissing = row[4];
	this.matches = this.generateMatchFunction();
	this.replacement = row[5];
};

function CellReplacement(row) {
	this.objectsClear = row[0];
	this.objectsSet = row[1];
	this.movementsClear = row[2];
	this.movementsSet = row[3];
	this.movementsLayerMask = row[4];
	this.randomEntityMask = row[5];
	this.randomDirMask = row[6];
};


var matchCache = {};



CellPattern.prototype.generateMatchString = function() {
	var fn = "(true";
	for (var i = 0; i < Math.max(STRIDE_OBJ, STRIDE_MOV); ++i) {
		var co = 'cellObjects' + i;
		var cm = 'cellMovements' + i;
		var op = this.objectsPresent.data[i];
		var om = this.objectsMissing.data[i];
		var mp = this.movementsPresent.data[i];
		var mm = this.movementsMissing.data[i];
		if (op) {
			if (op&(op-1))
				fn += '\t\t&& ((' + co + '&' + op + ')===' + op + ')\n';
			else
				fn += '\t\t&& (' + co + '&' + op + ')\n';
		}
		if (om)
			fn += '\t\t&& !(' + co + '&' + om + ')\n';
		if (mp) {
			if (mp&(mp-1))
				fn += '\t\t&& ((' + cm + '&' + mp + ')===' + mp + ')\n';
			else
				fn += '\t\t&& (' + cm + '&' + mp + ')\n';
		}
		if (mm)
			fn += '\t\t&& !(' + cm + '&' + mm + ')\n';
	}
	for (var j = 0; j < this.anyObjectsPresent.length; j++) {
		fn += "\t\t&& (0";
		for (var i = 0; i < STRIDE_OBJ; ++i) {
			var aop = this.anyObjectsPresent[j].data[i];
			if (aop)
				fn += "|(cellObjects" + i + "&" + aop + ")";
		}
		fn += ")";
	}
	fn += '\t)';
	return fn;
}

CellPattern.prototype.generateMatchFunction = function() {
	var i;
	var fn = '';
	var mul = STRIDE_OBJ === 1 ? '' : '*'+STRIDE_OBJ;	
	for (var i = 0; i < STRIDE_OBJ; ++i) {
		fn += '\tvar cellObjects' + i + ' = objects[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	mul = STRIDE_MOV === 1 ? '' : '*'+STRIDE_MOV;
	for (var i = 0; i < STRIDE_MOV; ++i) {
		fn += '\tvar cellMovements' + i + ' = movements[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	fn += "return " + this.generateMatchString()+';';
	if (fn in matchCache) {
		return matchCache[fn];
	}
	//console.log(fn.replace(/\s+/g, ' '));
	return matchCache[fn] = new Function("i", "objects", "movements", fn);
}

var _o1,_o2,_o2_5,_o3,_o4,_o5,_o6,_o7,_o8,_o9,_o10,_o11,_o12;
var _m1,_m2,_m3;

CellPattern.prototype.replace = function(rule, currentIndex) {
	var replace = this.replacement;

	if (replace === null) {
		return false;
	}

	var replace_RandomEntityMask = replace.randomEntityMask;
	var replace_RandomDirMask = replace.randomDirMask;

	var objectsSet = replace.objectsSet.cloneInto(_o1);
	var objectsClear = replace.objectsClear.cloneInto(_o2);

	var movementsSet = replace.movementsSet.cloneInto(_m1);
	var movementsClear = replace.movementsClear.cloneInto(_m2);
	movementsClear.ior(replace.movementsLayerMask);

	if (!replace_RandomEntityMask.iszero()) {
		var choices=[];
		for (var i=0;i<32*STRIDE_OBJ;i++) {
			if (replace_RandomEntityMask.get(i)) {
				choices.push(i);
			}
		}
		var rand = choices[Math.floor(RandomGen.uniform() * choices.length)];
		var n = state.idDict[rand];
		var o = state.objects[n];
		objectsSet.ibitset(rand);
		objectsClear.ior(state.layerMasks[o.layer]);
		movementsClear.ishiftor(0x1f, 5 * o.layer);
	}
	if (!replace_RandomDirMask.iszero()) {
		for (var layerIndex=0;layerIndex<level.layerCount;layerIndex++){
			if (replace_RandomDirMask.get(5*layerIndex)) {
				var randomDir = Math.floor(RandomGen.uniform()*4);
				movementsSet.ibitset(randomDir + 5 * layerIndex);
			}
		}
	}
	
	var curCellMask = level.getCellInto(currentIndex,_o2_5);
	var curMovementMask = level.getMovements(currentIndex);

	var oldCellMask = curCellMask.cloneInto(_o3);
	var oldMovementMask = curMovementMask.cloneInto(_m3);

	curCellMask.iclear(objectsClear);
	curCellMask.ior(objectsSet);

	curMovementMask.iclear(movementsClear);
	curMovementMask.ior(movementsSet);

	var rigidchange=false;
	var curRigidGroupIndexMask =0;
	var curRigidMovementAppliedMask =0;
	if (rule.isRigid) {
		var rigidGroupIndex = state.groupNumber_to_RigidGroupIndex[rule.groupNumber];
		rigidGroupIndex++;//don't forget to -- it when decoding :O
		var rigidMask = new BitVec(STRIDE_MOV);
		for (var layer = 0; layer < level.layerCount; layer++) {
			rigidMask.ishiftor(rigidGroupIndex, layer * 5);
		}
		rigidMask.iand(replace.movementsLayerMask);
		curRigidGroupIndexMask = level.rigidGroupIndexMask[currentIndex] || new BitVec(STRIDE_MOV);
		curRigidMovementAppliedMask = level.rigidMovementAppliedMask[currentIndex] || new BitVec(STRIDE_MOV);

		if (!rigidMask.bitsSetInArray(curRigidGroupIndexMask.data) &&
			!replace.movementsLayerMask.bitsSetInArray(curRigidMovementAppliedMask.data) ) {
			curRigidGroupIndexMask.ior(rigidMask);
			curRigidMovementAppliedMask.ior(replace.movementsLayerMask);
			rigidchange=true;

		}
	}

	var result = false;

	//check if it's changed
	if (!oldCellMask.equals(curCellMask) || !oldMovementMask.equals(curMovementMask) || rigidchange) { 
		result=true;
		if (rigidchange) {
			level.rigidGroupIndexMask[currentIndex] = curRigidGroupIndexMask;
			level.rigidMovementAppliedMask[currentIndex] = curRigidMovementAppliedMask;
		}

		var created = curCellMask.cloneInto(_o4);
		created.iclear(oldCellMask);
		sfxCreateMask.ior(created);
		var destroyed = oldCellMask.cloneInto(_o5);
		destroyed.iclear(curCellMask);
		sfxDestroyMask.ior(destroyed);

		level.setCell(currentIndex, curCellMask);
		level.setMovements(currentIndex, curMovementMask);

		var colIndex=(currentIndex/level.height)|0;
		var rowIndex=(currentIndex%level.height);
		level.colCellContents[colIndex].ior(curCellMask);
		level.rowCellContents[rowIndex].ior(curCellMask);
		level.mapCellContents.ior(curCellMask);

	}

	return result;
}


//say cellRow has length 5, with a split in the middle
/*
function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {

	var result = [];
	var matchfirsthalf = cellRow[0].matches(i)&&cellRow[1].matches((i+d)%level.n_tiles);
	if (matchfirsthalf) {
		for (var k=mink,kmaxk;k++) {
			if (cellRow[2].matches((i+d*(k+0))%level.n_tiles)&&cellRow[2].matches((i+d*(k+1))%level.n_tiles)) {
				result.push([i,k]);
			}
		}
	}
	return result;
}
*/
/*
function DoesCellRowMatchWildCard(direction,cellRow,i,maxk,mink) {
	if (mink === undefined) {
		mink = 0;
	}

	var cellPattern = cellRow[0];

    //var result=[];

    if (cellPattern.matches(i)){
    	var delta = dirMasksDelta[direction];
    	var d0 = delta[0]*level.height;
		var d1 = delta[1];
        var targetIndex = i;

        for (var j=1;j<cellRow.length;j+=1) {
            targetIndex = (targetIndex+d1+d0);

            var cellPattern = cellRow[j]
            if (cellPattern === ellipsisPattern) {
            	//BAM inner loop time
            	for (var k=mink;k<maxk;k++) {
            		var targetIndex2=targetIndex;
                    targetIndex2 = (targetIndex2+(d1+d0)*(k)+level.n_tiles)%level.n_tiles;
            		for (var j2=j+1;j2<cellRow.length;j2++) {
		                cellPattern = cellRow[j2];
					    if (!cellPattern.matches(targetIndex2)) {
					    	break;
					    }
                        targetIndex2 = (targetIndex2+d1+d0);
            		}

		            if (j2>=cellRow.length) {
		            	return true;
		                //result.push([i,k]);
		            }
            	}
            	break;
            } else if (!cellPattern.matches(targetIndex)) {
				break;
            }
        }               
    }  
    return false;
}
*/
//say cellRow has length 3
/*
CellRow Matches can be specialized to look something like:
function cellRowMatchesFunctionGenerate(direction,cellRow,i) {
	var delta = dirMasksDelta[direction];
	var d = delta[1]+delta[0]*level.height;
	return cellRow[0].matches(i)&&cellRow[1].matches((i+d)%level.n_tiles)&&cellRow[2].matches((i+2*d)%level.n_tiles);
}
*/
/*
function DoesCellRowMatch(direction,cellRow,i,k) {
	var cellPattern = cellRow[0];
    if (cellPattern.matches(i)) {

	    var delta = dirMasksDelta[direction];
	    var d0 = delta[0]*level.height;
		var d1 = delta[1];
		var cr_l = cellRow.length;

        var targetIndex = i;
        for (var j=1;j<cr_l;j++) {
            targetIndex = (targetIndex+d1+d0);
            cellPattern = cellRow[j];
			if (cellPattern === ellipsisPattern) {
					//only for once off verifications
            	targetIndex = (targetIndex+(d1+d0)*k); 					
            }
		    if (!cellPattern.matches(targetIndex)) {
                break;
            }
        }   
        
        if (j>=cellRow.length) {
            return true;
        }

    }  
    return false;
}
*/
function matchCellRow(direction, cellRowMatch, cellRow, cellRowMask,cellRowMask_Movements,d) {	
	var result=[];
	
	if ((!cellRowMask.bitsSetInArray(level.mapCellContents.data))||
	(!cellRowMask_Movements.bitsSetInArray(level.mapCellContents_Movements.data))) {
		return result;
	}

	var xmin=0;
	var xmax=level.width;
	var ymin=0;
	var ymax=level.height;

    var len=cellRow.length;

    switch(direction) {
    	case 1://up
    	{
    		ymin+=(len-1);
    		break;
    	}
    	case 2: //down 
    	{
			ymax-=(len-1);
			break;
    	}
    	case 4: //left
    	{
    		xmin+=(len-1);
    		break;
    	}
    	case 8: //right
		{
			xmax-=(len-1);	
			break;
		}
    	default:
    	{
    		window.console.log("EEEP "+direction);
    	}
    }

    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(level.rowCellContents[y].data) 
			|| !cellRowMask_Movements.bitsSetInArray(level.rowCellContents_Movements[y].data)) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*level.height+y;
				if (cellRowMatch(cellRow,i,d, level.objects, level.movements))
				{
					result.push(i);
				}
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(level.colCellContents[x].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.colCellContents_Movements[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*level.height+y;
				if (cellRowMatch(	cellRow,i, d, level.objects, level.movements))
				{
					result.push(i);
				}
			}
		}		
	}

	return result;
}


function matchCellRowWildCard(direction, cellRowMatch, cellRow,cellRowMask,cellRowMask_Movements,d,wildcardCount) {
	var result=[];
	if ((!cellRowMask.bitsSetInArray(level.mapCellContents.data))
	|| (!cellRowMask_Movements.bitsSetInArray(level.mapCellContents_Movements.data))) {
		return result;
	}
	
	var xmin=0;
	var xmax=level.width;
	var ymin=0;
	var ymax=level.height;

	var len=cellRow.length-wildcardCount;//remove one to deal with wildcard
    switch(direction) {
    	case 1://up
    	{
    		ymin+=(len-1);
    		break;
    	}
    	case 2: //down 
    	{
			ymax-=(len-1);
			break;
    	}
    	case 4: //left
    	{
    		xmin+=(len-1);
    		break;
    	}
    	case 8: //right
		{
			xmax-=(len-1);	
			break;
		}
    	default:
    	{
    		window.console.log("EEEP2 "+direction);
    	}
    }



    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(level.rowCellContents[y].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.rowCellContents_Movements[y].data) ) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*level.height+y;
				var kmax;

				if (direction === 4) { //left
					kmax=x-len+2;
				} else if (direction === 8) { //right
					kmax=level.width-(x+len)+1;	
				} else {
					window.console.log("EEEP2 "+direction);					
				}

				if (wildcardCount===1) {
					result.push.apply(result, cellRowMatch(cellRow,i,kmax,0, d, level.objects, level.movements));
				} else {
					result.push.apply(result, cellRowMatch(cellRow,i,kmax,0,kmax,0,kmax,0, d, level.objects, level.movements));
				}
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(level.colCellContents[x].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.colCellContents_Movements[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*level.height+y;
				var kmax;

				if (direction === 2) { // down
					kmax=level.height-(y+len)+1;
				} else if (direction === 1) { // up
					kmax=y-len+2;					
				} else {
					window.console.log("EEEP2 "+direction);
				}
				if (wildcardCount===1) {
					result.push.apply(result, cellRowMatch(cellRow,i,kmax,0, d, level.objects, level.movements));
				} else {
					result.push.apply(result, cellRowMatch(cellRow,i,kmax,0, kmax,0, kmax,0, d, level.objects, level.movements));
				}
			}
		}		
	}

	return result;
}

function generateTuples(lists) {
    var tuples=[[]];

    for (var i=0;i<lists.length;i++)
    {
        var row = lists[i];
        var newtuples=[];
        for (var j=0;j<row.length;j++) {
            var valtoappend = row[j];
            for (var k=0;k<tuples.length;k++) {
                var tuple=tuples[k];
                var newtuple = tuple.concat([valtoappend]);
                newtuples.push(newtuple);
            }
        }
        tuples=newtuples;
    }
    return tuples;
}



Rule.prototype.findMatches = function() {	
	if ( ! this.ruleMask.bitsSetInArray(level.mapCellContents.data) )
		return [];

	const d = level.delta_index(this.direction)

	var matches=[];
	var cellRowMasks=this.cellRowMasks;
	var cellRowMasks_Movements=this.cellRowMasks_Movements;
    for (var cellRowIndex=0;cellRowIndex<this.patterns.length;cellRowIndex++) {
        var cellRow = this.patterns[cellRowIndex];
        var matchFunction = this.cellRowMatches[cellRowIndex];
        if (this.ellipsisCount[cellRowIndex]===1) {//if ellipsis     
        	var match = matchCellRowWildCard(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex],cellRowMasks_Movements[cellRowIndex],d,this.ellipsisCount[cellRowIndex]);  
        } else  if (this.ellipsisCount[cellRowIndex]===0) {
        	var match = matchCellRow(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex],cellRowMasks_Movements[cellRowIndex],d);               	
        } else { // ellipsiscount===2
        	var match = matchCellRowWildCard(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex],cellRowMasks_Movements[cellRowIndex],d,this.ellipsisCount[cellRowIndex]);  
		}
        if (match.length===0) {
            return [];
        } else {
            matches.push(match);
        }
    }
    return matches;
};

Rule.prototype.directional = function(){
	//Check if other rules in its rulegroup with the same line number.
	for (var i=0;i<state.rules.length;i++){
		var rg = state.rules[i];
		var copyCount=0;
		for (var j=0;j<rg.length;j++){
			if (this.lineNumber===rg[j].lineNumber){
				copyCount++;
			}
			if (copyCount>1){
				return true;
			}
		}
	}

    return false;
}

Rule.prototype.applyAt = function(level,tuple,check,delta) {
	var rule = this;
	//have to double check they apply 
	//(cf test ellipsis bug: rule matches two candidates, first replacement invalidates second)
	if (check)
	{
		for (var cellRowIndex=0; cellRowIndex<this.patterns.length; cellRowIndex++)
		{
			if (this.ellipsisCount[cellRowIndex]===1)
			{
				if ( this.cellRowMatches[cellRowIndex](
						this.patterns[cellRowIndex], 
						tuple[cellRowIndex][0], 
						tuple[cellRowIndex][1]+1, 
							tuple[cellRowIndex][1], 
						delta, level.objects, level.movements
					).length == 0 )
					return false
			} else if (this.ellipsisCount[cellRowIndex]===2){
				if ( this.cellRowMatches[cellRowIndex](
					this.patterns[cellRowIndex], 
						tuple[cellRowIndex][0],  
						tuple[cellRowIndex][1]+tuple[cellRowIndex][2]+1, 
							tuple[cellRowIndex][1]+tuple[cellRowIndex][2], 
						tuple[cellRowIndex][1]+1, 
							tuple[cellRowIndex][1],  
						tuple[cellRowIndex][2]+1, 
							tuple[cellRowIndex][2], 
							delta, level.objects, level.movements
						).length == 0 )
					return false
			} else {
				if ( ! this.cellRowMatches[cellRowIndex](
					this.patterns[cellRowIndex], 
						tuple[cellRowIndex], 
						delta, level.objects, level.movements
						) )
				return false
			}
		}
	}


    var result=false;
	var anyellipses=false;

    //APPLY THE RULE
    for (var cellRowIndex=0;cellRowIndex<rule.patterns.length;cellRowIndex++) {
        var preRow = rule.patterns[cellRowIndex];
    	var ellipse_index=0;

        var currentIndex = rule.ellipsisCount[cellRowIndex]>0 ? tuple[cellRowIndex][0] : tuple[cellRowIndex];
        for (var cellIndex=0;cellIndex<preRow.length;cellIndex++) {
            var preCell = preRow[cellIndex];

            if (preCell === ellipsisPattern) {
            	var k = tuple[cellRowIndex][1+ellipse_index];
				ellipse_index++;
				anyellipses=true;
            	currentIndex += delta*k;
            	continue;
            }

            result = preCell.replace(rule, currentIndex) || result;

            currentIndex += delta;
        }
    }

	if (verbose_logging && result){
		var ruleDirection = dirMaskName[rule.direction];
		if (!rule.directional()){
			ruleDirection="";
		}

		var inspect_ID =  addToDebugTimeline(level,rule.lineNumber);
		var gapMessage="";
		// var gapcount=0;
		// if (anyellipses){
		// 	var added=0;
		// 	for(var i=0;i<tuple.length;i++){
		// 		var tuples_cellrow = tuple[i];
		// 		//Start at index 1 because index 0 just is the index where the rule starts.
		// 		for (var j=1;j<tuples_cellrow.length;j++){
		// 			added++;
		// 			if (gapMessage.length>0){
		// 				gapMessage+=", ";
		// 			}
		// 			gapMessage+=tuples_cellrow[j];
		// 		}			
		// 	}
		// 	if (added===1){
		// 		gapMessage = " (ellipsis gap of length "+gapMessage+")";
		// 	} else {
		// 		gapMessage = " (ellipsis gaps of length "+gapMessage+")";
		// 	}
		// }
		
		var logString = `<font color="green">Rule <a onclick="jumpToLine(${rule.lineNumber});"  href="javascript:void(0);">${rule.lineNumber}</a> ${ruleDirection} applied${gapMessage}.</font>`;
		consolePrint(logString,false,rule.lineNumber,inspect_ID);
		
	}

    return result;
};

Rule.prototype.tryApply = function(level) {
	const delta = level.delta_index(this.direction);

    //get all cellrow matches
    var matches = this.findMatches();
    if (matches.length===0) {
    	return false;
    }

    var result=false;	
	if (this.hasReplacements) {
	    var tuples = generateTuples(matches);
	    for (var tupleIndex=0;tupleIndex<tuples.length;tupleIndex++) {
	        var tuple = tuples[tupleIndex];
	        var shouldCheck=tupleIndex>0;
	        var success = this.applyAt(level,tuple,shouldCheck,delta);
	        result = success || result;
	    }
	}

    if (matches.length>0) {
    	this.queueCommands();
    }
    return result;
};

Rule.prototype.queueCommands = function() {
	var commands = this.commands;
	
	if (commands.length==0){
		return;
	}

	//commandQueue is an array of strings, message.commands is an array of array of strings (For messagetext parameter), so I search through them differently
	var preexisting_cancel=level.commandQueue.indexOf("cancel")>=0;
	var preexisting_restart=level.commandQueue.indexOf("restart")>=0;
	
	var currule_cancel = false;
	var currule_restart = false;
	for (var i=0;i<commands.length;i++){
		var cmd = commands[i][0];
		if (cmd==="cancel"){
			currule_cancel=true;
		} else if (cmd==="restart"){
			currule_restart=true;
		}
	}

	//priority cancel > restart > everything else
	//if cancel is the queue from other rules, ignore everything
	if (preexisting_cancel){
		return;
	}
	//if restart is in the queue from other rules, only apply if there's a cancel present here
	if (preexisting_restart && !currule_cancel){
		return;
	}

	//if you are writing a cancel or restart, clear the current queue
	if (currule_cancel || currule_restart){
		level.commandQueue=[];
        level.commandQueueSourceRules=[];
		messagetext="";
	}

	for(var i=0;i<commands.length;i++) {
		var command=commands[i];
		var already=false;
		if (level.commandQueue.indexOf(command[0])>=0) {
			continue;
		}
		level.commandQueue.push(command[0]);
		level.commandQueueSourceRules.push(this);

		if (verbose_logging){
			var lineNumber = this.lineNumber;
			var ruleDirection = dirMaskName[this.direction];
			var logString = '<font color="green">Rule <a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);">' + lineNumber.toString() + '</a> triggers command '+command[0]+'.</font>';
			consolePrint(logString,false,lineNumber,null);
		}

		if (command[0]==='message') {			
			messagetext=command[1];
		}		
	}
};

function showTempMessage() {
	keybuffer=[];
	textMode=true;
	titleScreen=false;
	quittingMessageScreen=false;
	messageselected=false;
	ignoreNotJustPressedAction=true;
	tryPlayShowMessageSound();
	drawMessageScreen();
	canvasResize();
}

function processOutputCommands(commands) {
	for (var i=0;i<commands.length;i++) {
		var command = commands[i];
		if (command.charAt(1)==='f')  {//identifies sfxN
			tryPlaySimpleSound(command);
		}
		if (unitTesting===false) {
			if (command==='message') {
				showTempMessage();
			}
		}
	}
}

function applyRandomRuleGroup(level,ruleGroup) {
	var propagated=false;

	var matches=[];
	for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
		var rule=ruleGroup[ruleIndex];
		var ruleMatches = rule.findMatches();
		if (ruleMatches.length>0) {
	    	var tuples  = generateTuples(ruleMatches);
	    	for (var j=0;j<tuples.length;j++) {
	    		var tuple=tuples[j];
				matches.push([ruleIndex,tuple]);
	    	}
		}		
	}

	if (matches.length===0)
	{
		return false;
	} 

	var match = matches[Math.floor(RandomGen.uniform()*matches.length)];
	var ruleIndex=match[0];
	var rule=ruleGroup[ruleIndex];
	var tuple=match[1];
	var check=false;
	const delta = level.delta_index(rule.direction)
	var modified = rule.applyAt(level,tuple,check,delta);

   	rule.queueCommands();

	return modified;
}


function applyRuleGroup(ruleGroup) {
	if (ruleGroup[0].isRandom) {
		return applyRandomRuleGroup(level,ruleGroup);
	}

	var loopPropagated=false;
    var propagated=true;
    var loopcount=0;
	var nothing_happened_counter = -1;
    while(propagated) {
    	loopcount++;
    	if (loopcount>200) 
    	{
    		logErrorCacheable("Got caught looping lots in a rule group :O",ruleGroup[0].lineNumber,true);
    		break;
    	}
        propagated=false;

        for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
            var rule = ruleGroup[ruleIndex];     
			if (rule.tryApply(level)){
				propagated=true;
				nothing_happened_counter=0;//why am I resetting to 1 rather than 0? because I've just verified that applications of the current rule are exhausted
			} else {
				nothing_happened_counter++;
			}
			if ( nothing_happened_counter === ruleGroup.length)
				break;
        }
        if (propagated) {
        	loopPropagated=true;
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        }
    }

    return loopPropagated;
}

function applyRules(rules, loopPoint, startRuleGroupindex, bannedGroup){
    //for each rule
    //try to match it

    //when we're going back in, let's loop, to be sure to be sure
    var loopPropagated = startRuleGroupindex>0;
    var loopCount = 0;
    for (var ruleGroupIndex=startRuleGroupindex;ruleGroupIndex<rules.length;) {
    	if (bannedGroup && bannedGroup[ruleGroupIndex]) {
    		//do nothing
    	} else {
    		var ruleGroup=rules[ruleGroupIndex];
			loopPropagated = applyRuleGroup(ruleGroup) || loopPropagated;
	    }
        if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
        	ruleGroupIndex = loopPoint[ruleGroupIndex];
        	loopPropagated=false;
        	loopCount++;
			if (loopCount > 200) {
    			var ruleGroup=rules[ruleGroupIndex];
			   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
			   	break;
			}
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        } else {
        	ruleGroupIndex++;
        	if (ruleGroupIndex===rules.length) {
        		if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
		        	ruleGroupIndex = loopPoint[ruleGroupIndex];
		        	loopPropagated=false;
		        	loopCount++;
					if (loopCount > 200) {
		    			var ruleGroup=rules[ruleGroupIndex];
					   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
					   	break;
					}
		        } 
        	}
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        }
    }
}


//if this returns!=null, need to go back and reprocess
function resolveMovements(level, bannedGroup){
    var moved=true;
    while(moved){
        moved=false;
        for (var i=0;i<level.n_tiles;i++) {
        	moved = repositionEntitiesAtCell(i) || moved;
        }
    }
    var doUndo=false;

	//Search for any rigidly-caused movements remaining
	for (var i=0;i<level.n_tiles;i++) {
		var cellMask = level.getCellInto(i,_o6);
		var movementMask = level.getMovements(i);
		if (!movementMask.iszero()) {
			var rigidMovementAppliedMask = level.rigidMovementAppliedMask[i];
			if (!rigidMovementAppliedMask.iszero()) {
				movementMask.iand(rigidMovementAppliedMask);
				if (!movementMask.iszero()) {
					//find what layer was restricted
					for (var j=0;j<level.layerCount;j++) {
						var layerSection = movementMask.getshiftor(0x1f, 5*j);
						if (layerSection!==0) {
							//this is our layer!
							var rigidGroupIndexMask = level.rigidGroupIndexMask[i];
							var rigidGroupIndex = rigidGroupIndexMask.getshiftor(0x1f, 5*j);
							rigidGroupIndex--;//group indices start at zero, but are incremented for storing in the bitfield
							var groupIndex = state.rigidGroupIndex_to_GroupIndex[rigidGroupIndex];
							if (bannedGroup[groupIndex]!==true){
								bannedGroup[groupIndex]=true
								//backtrackTarget = rigidBackups[rigidGroupIndex];
								doUndo=true;
							}
							break;
						}
					}
				}
			}
			for (var j=0;j<state.sfx_MovementFailureMasks.length;j++) {
				var o = state.sfx_MovementFailureMasks[j];
				var objectMask = o.objectMask;
				if (objectMask.anyBitsInCommon(cellMask)) {
					var directionMask = o.directionMask;
					if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CantMove.indexOf(o.seed)===-1) {
						seedsToPlay_CantMove.push(o.seed);
					}
				}
			}
    	}

    	for (var j=0;j<STRIDE_MOV;j++) {
    		level.movements[j+i*STRIDE_MOV]=0;
    	}
	    level.rigidGroupIndexMask[i].setZero();
	    level.rigidMovementAppliedMask[i].setZero();
    }
    return doUndo;
}

var sfxCreateMask=null;
var sfxDestroyMask=null;

function calculateRowColMasks() {
	for(var i=0;i<level.mapCellContents.data.length;i++) {
		level.mapCellContents.data[i]=0;
		level.mapCellContents_Movements.data[i]=0;	
	}

	for (var i=0;i<level.width;i++) {
		var ccc = level.colCellContents[i];
		ccc.setZero();
		var ccc_Movements = level.colCellContents_Movements[i];
		ccc_Movements.setZero();
	}

	for (var i=0;i<level.height;i++) {
		var rcc = level.rowCellContents[i];
		rcc.setZero();
		var rcc_Movements = level.rowCellContents_Movements[i];
		rcc_Movements.setZero();
	}

	for (var i=0;i<level.width;i++) {
		for (var j=0;j<level.height;j++) {
			var index = j+i*level.height;
			var cellContents=level.getCellInto(index,_o9);
			level.mapCellContents.ior(cellContents);
			level.rowCellContents[j].ior(cellContents);
			level.colCellContents[i].ior(cellContents);

			
			var mapCellContents_Movements=level.getMovementsInto(index,_m1);
			level.mapCellContents_Movements.ior(mapCellContents_Movements);
			level.rowCellContents_Movements[j].ior(mapCellContents_Movements);
			level.colCellContents_Movements[i].ior(mapCellContents_Movements);
		}
	}
}

/* returns a bool indicating if anything changed */
function processInput(dir,dontDoWin,dontModify) {
	againing = false;

	var bak = backupLevel();
	var inputindex=dir;

	var playerPositions=[];
    if (dir<=4) {//when is dir>4???


		if (verbose_logging) { 
			debugger_turnIndex++;
			addToDebugTimeline(level,-2);//pre-movement-applied debug state
		}


    	if (dir>=0) {
	        switch(dir){
	            case 0://up
	            {
	                dir=parseInt('00001', 2);;
	                break;
	            }
	            case 1://left
	            {
	                dir=parseInt('00100', 2);;
	                break;
	            }
	            case 2://down
	            {
	                dir=parseInt('00010', 2);;
	                break;
	            }
	            case 3://right
	            {
	                dir=parseInt('01000', 2);;
	                break;
	            }
	            case 4://action
	            {
	                dir=parseInt('10000', 2);;
	                break;
	            }
	        }
	        playerPositions = startMovement(dir);
		}
			
		
		if (verbose_logging) { 
			consolePrint('Applying rules');

			var inspect_ID = addToDebugTimeline(level,-1);
				
			 if (dir===-1) {
				 consolePrint(`Turn starts with no input.`,false,null,inspect_ID)
			 } else {
				//  consolePrint('=======================');
				consolePrint(`Turn starts with input of ${['up','left','down','right','action'][inputindex]}.`,false,null,inspect_ID);
			 }
		}

		
        var bannedGroup = [];

        level.commandQueue=[];
        level.commandQueueSourceRules=[];
        var startRuleGroupIndex=0;
        var rigidloop=false;
		const startState = {
			objects: new Int32Array(level.objects),
			movements: new Int32Array(level.movements),
			rigidGroupIndexMask: level.rigidGroupIndexMask.concat([]),
			rigidMovementAppliedMask: level.rigidMovementAppliedMask.concat([]),
			commandQueue: [],
			commandQueueSourceRules: []
		}
	    // sfxCreateMask.setZero();
	    // sfxDestroyMask.setZero();

		seedsToPlay_CanMove=[];
		seedsToPlay_CantMove=[];

		calculateRowColMasks();

		var alreadyResolved=[];

        var i=0;
        do {
        //not particularly elegant, but it'll do for now - should copy the world state and check
        //after each iteration
        	rigidloop=false;
        	i++;
        	
        	applyRules(state.rules, state.loopPoint, startRuleGroupIndex, bannedGroup);
        	var shouldUndo = resolveMovements(level, bannedGroup);

        	if (shouldUndo) {
        		rigidloop=true;

				{
					// trackback
					if (IDE){
						// newBannedGroups is the list of keys of bannedGroup that aren't already in alreadyResolved
						var newBannedGroups = [];
						for (var key in bannedGroup) {
							if (!alreadyResolved.includes(key)) {
								newBannedGroups.push(key);
								alreadyResolved.push(key);
							}
						}
						var bannedLineNumbers = newBannedGroups.map( rgi => state.rules[rgi][0].lineNumber);
						var ts = bannedLineNumbers.length>1 ? "lines " : "line ";
						ts += bannedLineNumbers.map(ln => `<a onclick="jumpToLine(${ln});" href="javascript:void(0);">${ln}</a>`).join(", ");
						consolePrint(`Rigid movement application failed in rule-Group starting from ${ts}, and will be disabled in resimulation. Rolling back...`)
					}
					//don't need to concat or anythign here, once something is restored it won't be used again.
					level.objects = new Int32Array(startState.objects)
					level.movements = new Int32Array(startState.movements)
					level.rigidGroupIndexMask = startState.rigidGroupIndexMask.concat([])
					level.rigidMovementAppliedMask = startState.rigidMovementAppliedMask.concat([])
					// TODO: shouldn't we also save/restore the level data computed by level.calculateRowColMasks() ?
					level.commandQueue = startState.commandQueue.concat([])
					level.commandQueueSourceRules = startState.commandQueueSourceRules.concat([])
					// sfxCreateMask.setZero()
					// sfxDestroyMask.setZero()
					// TODO: should

				}

				if (verbose_logging && rigidloop && i>0){				
					consolePrint('Relooping through rules because of rigid.');
						
					debugger_turnIndex++;
					addToDebugTimeline(level,-2);//pre-movement-applied debug state
				}

        		startRuleGroupIndex=0;//rigidGroupUndoDat.ruleGroupIndex+1;
        	} else {
        		if (verbose_logging){

					var eof_idx = debug_visualisation_array[debugger_turnIndex].length+1;//just need some number greater than any rule group
					var inspect_ID = addToDebugTimeline(level,eof_idx);

					consolePrint(`Processed movements.`,false,null,inspect_ID);
					
					if (state.lateRules.length>0){
											
						debugger_turnIndex++;
						addToDebugTimeline(level,-2);//pre-movement-applied debug state
					
						consolePrint('Applying late rules');
					}
				}
        		applyRules(state.lateRules, state.lateLoopPoint, 0);
        		startRuleGroupIndex=0;
        	}
        } while (i < 50 && rigidloop);

        if (i>=50) {
            consolePrint("Looped through 50 times, gave up.  too many loops!");
        }


        if (playerPositions.length>0 && state.metadata.require_player_movement!==undefined) {
        	var somemoved=false;
        	for (var i=0;i<playerPositions.length;i++) {
        		var pos = playerPositions[i];
        		var val = level.getCell(pos);
        		if (state.playerMask.bitsClearInArray(val.data)) {
        			somemoved=true;
        			break;
        		}
        	}
        	if (somemoved===false) {
        		if (verbose_logging){
	    			consolePrint('require_player_movement set, but no player movement detected, so cancelling turn.');
	    			// consoleCacheDump();
				}
        		addUndoState(bak);
        		DoUndo(true,false);
        		return false;
        	}
        	//play player cantmove sounds here
        }



	    if (level.commandQueue.indexOf('cancel')>=0) {
	    	if (verbose_logging) { 
	    		// consoleCacheDump();
	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('cancel')];
	    		consolePrintFromRule('CANCEL command executed, cancelling turn.',r,true);
			}

			if (!dontModify){
				processOutputCommands(level.commandQueue);
			}

			var commandsleft = level.commandQueue.length>1;

    		addUndoState(bak);
    		DoUndo(true,false);
    		tryPlayCancelSound();
    		return commandsleft;
	    } 

	    if (level.commandQueue.indexOf('restart')>=0) {
			
    		if (verbose_logging && runrulesonlevelstart_phase){
				var r = level.commandQueueSourceRules[level.commandQueue.indexOf('restart')];
    			logWarning('A "restart" command is being triggered in the "run_rules_on_level_start" section of level creation, which would cause an infinite loop if it was actually triggered, but it\'s being ignored, so it\'s not.',r.lineNumber,true);
    		}

	    	if (verbose_logging) { 
	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('restart')];
	    		consolePrintFromRule('RESTART command executed, reverting to restart state.',r.lineNumber);
	    		// consoleCacheDump();
			}
			if (!dontModify){
				processOutputCommands(level.commandQueue);
			}
    		// addUndoState(bak);

			if (!dontModify){
	    		DoRestart(true);
			}
    		return true;
		} 
		
		
        var modified=false;
	    for (var i=0;i<level.objects.length;i++) {
	    	if (level.objects[i]!==bak.dat[i]) {
				// if (dontModify) {
	        	// 	if (verbose_logging) {
	        	// 		consoleCacheDump();
	        	// 	}
	        	// 	addUndoState(bak);
	        	// 	DoUndo(true,false);
				// 	return true;
				// } else {
					if (dir!==-1) {
						addUndoState(bak);
					} else if (backups.length > 0) {
						// This is for the case that diffs break the undo buffer for real-time games 
						// ( c f https://github.com/increpare/PuzzleScript/pull/796 ),
						// because realtime ticks are ignored when the user presses undo and the backup
						// array reflects this structure.  
						backups[backups.length - 1] = unconsolidateDiff(backups[backups.length - 1], bak);					
	    			}
	    			modified=true;
	    		// }
	    		break;
	    	}
	    }

		if (dontModify && level.commandQueue.indexOf('win')>=0) {	
	    	return true;	
		}
		
		if (dontModify) {		
    		if (verbose_logging) {
    			// consoleCacheDump();
    		}
			return false;
		}

        // for (var i=0;i<seedsToPlay_CantMove.length;i++) {			
	    //     	playSound(seedsToPlay_CantMove[i]);
        // }

        // for (var i=0;i<seedsToPlay_CanMove.length;i++) {
	    //     	playSound(seedsToPlay_CanMove[i]);
        // }

        // for (var i=0;i<state.sfx_CreationMasks.length;i++) {
        // 	var entry = state.sfx_CreationMasks[i];
        // 	if (sfxCreateMask.anyBitsInCommon(entry.objectMask)) {
	    //     	playSound(entry.seed);
        // 	}
        // }

        // for (var i=0;i<state.sfx_DestructionMasks.length;i++) {
        // 	var entry = state.sfx_DestructionMasks[i];
        // 	if (sfxDestroyMask.anyBitsInCommon(entry.objectMask)) {
	    //     	playSound(entry.seed);
        // 	}
        // }

		if (!dontModify){
	    	processOutputCommands(level.commandQueue);
		}

	    if (textMode===false) {
	    	if (verbose_logging) { 
	    		consolePrint('Checking win conditions.');
			}
			if (dontDoWin===undefined){
				dontDoWin = false;
			}
	    	checkWin( dontDoWin );
	    }

	    if (!winning) {
			if (level.commandQueue.indexOf('checkpoint')>=0) {
		    	if (verbose_logging) { 
	    			var r = level.commandQueueSourceRules[level.commandQueue.indexOf('checkpoint')];
		    		consolePrintFromRule('CHECKPOINT command executed, saving current state to the restart state.',r);
				}
				restartTarget=level4Serialization();
				hasUsedCheckpoint=true;
				var backupStr = JSON.stringify(restartTarget);
				storage_set(document.URL+'_checkpoint',backupStr);
				storage_set(document.URL,curlevel);				
			}	 

		    if (level.commandQueue.indexOf('again')>=0 && modified) {

	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('again')];

		    	//first have to verify that something's changed
		    	var old_verbose_logging=verbose_logging;
		    	var oldmessagetext = messagetext;
		    	verbose_logging=false;
		    	if (processInput(-1,true,true)) {
			    	verbose_logging=old_verbose_logging;

			    	if (verbose_logging) { 
			    		consolePrintFromRule('AGAIN command executed, with changes detected - will execute another turn.',r);
					}

			    	againing=true;
			    	timer=0;
			    } else {		    	
			    	verbose_logging=old_verbose_logging;
					if (verbose_logging) { 
						consolePrintFromRule('AGAIN command not executed, it wouldn\'t make any changes.',r);
					}
			    }
			    verbose_logging=old_verbose_logging;
			    messagetext = oldmessagetext;
		    }   
		}
		
		if (verbose_logging) { 
			consolePrint(`Turn complete`);    
		}
		
	    level.commandQueue=[];
	    level.commandQueueSourceRules=[];

    }

	if (verbose_logging) {
		// consoleCacheDump();
	}

	if (winning) {
		againing=false;
	}

	return modified;
}

function checkWin(dontDoWin) {

	if (levelEditorOpened) {
		dontDoWin=true;
	}

	if (level.commandQueue.indexOf('win')>=0) {
		if (runrulesonlevelstart_phase){
			consolePrint("Win Condition Satisfied (However this is in the run_rules_on_level_start rule pass, so I'm going to ignore it for you.  Why would you want to complete a level before it's already started?!)");		
		} else {
			consolePrint("Win Condition Satisfied");
		}
		if(!dontDoWin){
			DoWin();
		}
		return;
	}

	var won= false;
	if (state.winconditions.length>0)  {
		var passed=true;
		for (var wcIndex=0;wcIndex<state.winconditions.length;wcIndex++) {
			var wincondition = state.winconditions[wcIndex];
			var filter1 = wincondition[1];
			var filter2 = wincondition[2];
			var aggr1 = wincondition[4];
			var aggr2 = wincondition[5];

			var rulePassed=true;
			
			const f1 = aggr1 ? c=>filter1.bitsSetInArray(c) : c=>!filter1.bitsClearInArray(c);
			const f2 = aggr2 ? c=>filter2.bitsSetInArray(c) : c=>!filter2.bitsClearInArray(c);

			switch(wincondition[0]) {
				case -1://NO
				{
					for (var i=0;i<level.n_tiles;i++) {
						var cell = level.getCellInto(i,_o10);
						if ( (f1(cell.data)) &&  
							 (f2(cell.data)) ) {
							rulePassed=false;
							break;
						}
					}

					break;
				}
				case 0://SOME
				{
					var passedTest=false;
					for (var i=0;i<level.n_tiles;i++) {
						var cell = level.getCellInto(i,_o10);
						if ( (f1(cell.data)) &&  
							 (f2(cell.data)) ) {
							passedTest=true;
							break;
						}
					}
					if (passedTest===false) {
						rulePassed=false;
					}
					break;
				}
				case 1://ALL
				{
					for (var i=0;i<level.n_tiles;i++) {
						var cell = level.getCellInto(i,_o10);
						if ( (f1(cell.data)) &&  
							 (!f2(cell.data)) ) {
							rulePassed=false;
							break;
						}
					}
					break;
				}
			}
			if (rulePassed===false) {
				passed=false;
			}
		}
		won=passed;
	}

	if (won) {
		if (!dontDoWin){
			DoWin();
		}
	}
}

function DoWin() {
	if (winning) {
		return;
	}
	againing=false;
	tryPlayEndLevelSound();
	if (unitTesting) {
		nextLevel();
		return;
	}

	winning=true;
	timer=0;
}

/*
//this function isn't valid after refactoring, but also isn't used.
function anyMovements() {	
    for (var i=0;i<level.movementMask.length;i++) {
        if (level.movementMask[i]!==0) {
        	return true;
        }
    }
    return false;
}*/


function nextLevel() {
    againing=false;
	messagetext="";
	if (state && state.levels && (curlevel>state.levels.length) ){
		curlevel=state.levels.length-1;
	}
	ignoreNotJustPressedAction=true;
	if (titleScreen) {
		if (titleSelection===0) {
			//new game
			curlevel=0;
			curlevelTarget=null;
		} 			
		if (curlevelTarget!==null){			
			loadLevelFromStateTarget(state,curlevel,curlevelTarget);
		} else {
			loadLevelFromState(state,curlevel);
		}
	} else {	
		if (hasUsedCheckpoint){
			curlevelTarget=null;
			hasUsedCheckpoint=false;
		}
		if (curlevel<(state.levels.length-1))
		{			
			curlevel++;
			curlevelTarget=null;
			textMode=false;
			titleScreen=false;
			quittingMessageScreen=false;
			messageselected=false;

			if (curlevelTarget!==null){			
				loadLevelFromStateTarget(state,curlevel,curlevelTarget);
			} else {
				loadLevelFromState(state,curlevel);
			}
		} else {
			try{
				storage_remove(document.URL);
				storage_remove(document.URL+'_checkpoint');				
			} catch(ex){
					
			}
			
			curlevel=0;
			curlevelTarget=null;
			goToTitleScreen();
			tryPlayEndGameSound();
		}		
		//continue existing game
	}
	try {
		
		storage_set(document.URL,curlevel);
		if (curlevelTarget!==null){
			restartTarget=level4Serialization();
			var backupStr = JSON.stringify(restartTarget);
			storage_set(document.URL+'_checkpoint',backupStr);
		} else {
			storage_remove(document.URL+"_checkpoint");
		}		
		
	} catch (ex) {

	}

	if (state!==undefined && state.metadata.flickscreen!==undefined){
		oldflickscreendat=[0,0,Math.min(state.metadata.flickscreen[0],level.width),Math.min(state.metadata.flickscreen[1],level.height)];
	}
	canvasResize();	
}

function goToTitleScreen(){
    againing=false;
	messagetext="";
	titleScreen=true;
	textMode=true;
	doSetupTitleScreenLevelContinue();
	titleSelection=showContinueOptionOnTitleScreen()?1:0;
	generateTitleScreen();
	if (canvas!==null){//otherwise triggers error in cat bastard test
		regenSpriteImages();
	}
}

function getWinning() {
    return winning;
}

function setWinning(value) {
    winning=value;
}

function getLevel(){
    return level;
}

function getState(){
    return state;
}

function getRestarting(){
    return restarting;
}

function setRestarting(value){
    restarting=value;
}

function getRestartTarget(){
    return restartTarget;
}

function getDeltaTime(){
    return deltatime;
}

function setDeltaTime(value){
    deltatime=value;
}

function getAgaining(){
    return againing;
}

function getHasUsedCheckpoint(){
    return hasUsedCheckpoint;
}

function setHasUsedCheckpoint(value){
    hasUsedCheckpoint=value;
}

function get_o10(){
    return _o10;
}

module.exports = {
    compile, backupLevel, restoreLevel, processInput, addUndoState, 
    getWinning, setWinning, getLevel, getState, getRestarting, setRestarting, 
    getRestartTarget, getDeltaTime, setDeltaTime, getAgaining,
    getHasUsedCheckpoint, setHasUsedCheckpoint, get_o10
}
