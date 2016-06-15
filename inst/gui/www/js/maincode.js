$( function() {

$('#main_menu').smartmenus({
    subMenusSubOffsetX: 6,
    subMenusSubOffsetY: -8
});

var theData = "";
var dataCoords = "";

var divid = 0;

var history = ["library(QCA)"];
var histindex = 1;
var activecommand = "";

var help = 0;

var visiblerows = 16, visiblecols = 7;

var gridset, datacover;

var deheight = 400, dewidth = 659;

var scrollvh = [0, 0, visiblerows, visiblecols];

var tempdirfile = "";
var imported_filename = "";
var dirfile = "";
var dirfile_chosen = ["dir", "~", ""];
var rects_width;
var canvas_height;
var tempdatainfo = {ncols: 0, nrows: 0, colnames: [], rownames: []};
var datainfo = {ncols: 0, nrows: 0, colnames: [], rownames: []};
var ovBox, input; 

var tastaRcommand = "";
var tasta = "enter";

var import_open = "";
    import_open.obj = ["dir", ""];

var outres = new Array(); 

var Rcommand = {
    "counter": 0,
    "command": "",
    "brackets": [],
    "thinfo": {}
}

var closeplot = 0;
var plotopen = false;
var plotsize = [6, 6]; 
var tempcommand = "";
var escapeopen = false;

var changes = 0; 

var windowHeight = window.innerHeight;
var commandHeight = 100, resultHeight = 600;

if (windowHeight < 600) {
    resultHeight = 300;
    commandHeight = 75;
}

var string_command = "";

var dirfilevisit = false;
var eqmcc2R, tt2R, calib2R;

var colclicks = new Array();

var current_command = "";
var objname = "";

var dataModif = {};

var testX = 80, testY = 33;

var scrollbarsWH = getScrollBarWidth();

var visibledata, updatecounter = 0, updatecounter2 = 0;

var pathcopy;

var outputcopy, coordscopy;

var dirsfilescopy;
var dirfilist = {
    refresh: true,
    value: 0
}

var thinfo = {
    "counter": 0,
    "condition": "",
    "th": false,
    "nth": 1
};

var ths = new Array(6);

var thsetter_content; 
var poinths = {
    "message": "noresponse",
    "vals": [],
    "thvals": []
}
var thsetter_jitter = new Array();
var lastvals = new Array();

var xyplotdata = new Array();

var rloadcycles = 0;

var eqmccfromR = new Array();
var ttfromR = new Array();

var papers = {}; 

var read_table, importobj, exportobj, saveRplot, eqmcc, tt, calibrate, recode, xyplot;

function reset_read_table() {
    var rtcounter = (read_table == void 0)?0:read_table.counter;
    read_table = {
        "counter": rtcounter,
        "stdir": "",
        "filename": "",
        "sep": ",",
        "dec": ".",
        "header": true,
        "row_names": ""
    };
};

function reset_export() {
    var excounter = (exportobj == void 0)?0:exportobj.counter;
    exportobj = {
        "counter": excounter,
        "filename": "",
        "sep": ",",
        "dec": ".",
        "header": true,
        "caseid": "cases",
        "newfile": false
    };
};

function reset_eqmcc() {
    var eqcounter = (eqmcc == void 0)?0:eqmcc.counter;
    eqmcc = {
        "counter": eqcounter,
        "eqmcname": "",
        "outcome": new Array(),
        "neg_out": false,
        "conditions": new Array(),
        "relation": "suf",
        "n_cut": "1",
        "ic1": "1",
        "ic0": "",
        "explain": ["1"],
        "include": new Array(),
        "row_dom": false,
        "all_sol": false,
        "omit": "",
        "dir_exp": new Array(),
        "details": false,
        "show_cases": false,
        "inf_test": "",
        "use_tilde": false,
        "use_letters": false,
        "PRI": true
    };
};

function reset_tt() {
    var ttcounter = (tt == void 0)?0:tt.counter;
    tt = {
        "counter": ttcounter,
        "ttname": "tt", 
        "outcome": new Array(1),
        "neg_out": false,
        "conditions": new Array(),
        "n_cut": "1",
        "ic1": "1",
        "ic0": "",
        "complete": false,
        "show_cases": false,
        "sort_by": {"out": true, "incl": true, "n": true},
        "sort_sel": {"out": false, "incl": false, "n": false},
        "decreasing": true,
        "use_letters": false,
        "inf_test": "",
        "PRI": true
    };
};

function reset_calibrate() {
    var calcounter = (calibrate == void 0)?0:calibrate.counter;
    calibrate = {
        "counter": calcounter,
        "x": new Array(),
        "type": "crisp",
        "thresholds": new Array(1), 
        "thnames": new Array(),
        "thscopycrp": ["", "", ""],
        "thscopyfuz": ["", "", "", "", "", ""],
        "include": true,
        "logistic": true,
        "idm": "0.95",
        "ecdf": false,
        "below": "1",
        "above": "1",
        "same": true,
        "newvar": "",
        "increasing": true,
        "end": true,
        "findth": false,
        "thsetter": false,
        "thsettervar": "",
        "scrollvh": new Array(4),
        "jitter": false
    };
    
};

function reset_recode() {
    var recounter = (recode == void 0)?0:recode.counter;
    recode = {
        "counter": recounter,
        "x": "",
        "same": true,
        "newvar": "",
        "oldv": new Array(),
        "newv": new Array(),
        "scrollvh": new Array(4)
    };
};

function reset_xyplot() {
    var xycounter = (xyplot == void 0)?0:xyplot.counter;
    xyplot = {
        "counter": xycounter,
        "x": "",
        "y": "",
        "sufnec": "sufficiency",
        "pof": true,
        "mdguides": true,
        "labels": false,
        "fill": true,
        "jitter": false,
        "negy": false,
        "negx": false
    };
    xyplotdata = new Array();
    
};

function reset_saveRplot() {
    var savecounter = (saveRplot == void 0)?0:saveRplot.counter;
    saveRplot = {
        "counter": savecounter,
        "filename": "",
        "type": "png"
    };
};

reset_read_table(); 
reset_export(); 
reset_eqmcc();
reset_tt();
reset_calibrate();
reset_recode();
reset_xyplot();
reset_saveRplot();

var pingobj = 0;
var pingstarted = false;

Shiny.addCustomMessageHandler("ping",
    function(object) {
        
    }
);

Shiny.addCustomMessageHandler("tempdirfile",
    function(object) {
        tempdirfile = object;
    }
);

Shiny.addCustomMessageHandler("tempdatainfo",
    function(object) {
        tempdatainfo = object;
    }
);

Shiny.addCustomMessageHandler("dirfile",
    function(object) {
        dirfile = object;
    }
);

Shiny.addCustomMessageHandler("datainfo",
    function(object) {
        datainfo = object[0];
        theData = object[1];
        dataCoords = object[2];
        
    }
);

Shiny.addCustomMessageHandler("theData", 
    function(object) {
        theData = object[0];
        dataCoords = object[1];
    }
);

Shiny.addCustomMessageHandler("eqmcc",
    function(object) {
        outres = object[0];
        if (object[1] != null) {
            ttfromR = object[1][0]; 
            if ($("#venn").length) {
                papers["venn_main"].customtext = "";
            }
            draw_venn(papers["venn_main"]);
            
        }
    }
);

Shiny.addCustomMessageHandler("tt",
    function(object) {
        outres = object[0];
        if (object[1] != null) {
            ttfromR = object[1];
            if ($("#venn").length) {
                papers["venn_main"].customtext = "";
            }
            draw_venn(papers["venn_main"]);
        }
    }
);

Shiny.addCustomMessageHandler("calibrate",
    function(object) {
        outres = object;
    }
);
 
Shiny.addCustomMessageHandler("recode",
    function(object) {
        outres = object;
    }
);

Shiny.addCustomMessageHandler("dataPoints",
    function(object) {
        poinths = object;
    }
);

Shiny.addCustomMessageHandler("xyplot",
    function(object) {
        xyplotdata = object;
    }
);

Shiny.addCustomMessageHandler("Rcommand",
    function(object) {
        outres = object;
    }
);

Shiny.addCustomMessageHandler("getChanges",
    function(object) {
        outres = object;
    }
);

Shiny.addCustomMessageHandler("resizePlot",
    function(object) {
        outres = object;
    }
);

$("body").on("focus", "input, textarea", function() {
    $(this).on('keyup', function(evt) {
        evt = evt || event; 
        if (evt.keyCode == 27) { 
            tastaRcommand = "escape";
            tasta = "escape";
            input.blur();
        }
    });
    
    $(this).on('keydown', function(evt) {
        evt = evt || event; 
        var key = evt.which || evt.keyCode;
        if (key == 13) { 
            tastaRcommand = "enter";
            tasta = "enter";
            evt.preventDefault();
            input.blur();
        }
    });
});

function createCommandPromptInRconsole(prompt) {
    
    if (prompt === undefined) {
        prompt = ">"
    }
    
    $("#result_main").append("<div id = 'tempdiv' style='width:" + $("#result_main").width() + "px'><span style='color:#932192'>" + prompt + " </span></div>");
    
    $("#tempdiv").css({"border-color": "#b4d395", 
                       "border-width": "1px", 
                       "border-style": "solid"});
    
    $("#tempdiv").click(function(event) {
        event.stopPropagation();
        
        $("#tempdiv").css({"border": "none"});
        
        var container = this.parentNode;
        
        var oStyles = {
            background: 'none',
            width: ($("#tempdiv").width() - 24) + 'px',
            height: ($("#tempdiv").height() + 5) + 'px',
            zIndex: '9000',
            padding: '1 0 0 2',
            border: 'none', 
            resize: 'none',
            outline: 'none',
            'font-size': '14px',
            
            'font-family': "Monaco,Menlo,Consolas,'Courier New',monospace",
            color: 'blue',
            'overflow-y': 'hidden'
        }
        
        var sStyles = '';
        for (var z in oStyles){
            sStyles += z + ':' + oStyles[z] + ';';
        }
        
        input = document.createElement("textarea");
        input.value = "";
        input.setAttribute("style", sStyles);
        input.id = "txtarea";
        container.appendChild(input);
        
        var position = $("#tempdiv").position();
        
        $("#txtarea").position({my: "left top", at: "left+15px top", of: $("#tempdiv"), collision: "fitflip"});
        
        var crpos;
        
        $("#txtarea").on("keydown", function(evt) {
            crpos = caretPosition($("#txtarea"));
        });
        
        $("#txtarea").on("keyup", function(evt) {
            
            if (evt.keyCode == 38) { 
                if (histindex > 0 && crpos == input.value.length) { 
                    histindex -= 1;
                    input.value = history[histindex];
                }
            }
            else if (evt.keyCode == 40) { 
                if (crpos == input.value.length) {
                    if (histindex < history.length - 1) {
                        histindex += 1;
                        input.value = history[histindex];
                    }
                    else {
                        histindex = history.length;
                        input.value = activecommand;
                    }
                }
            }
            else if (evt.keyCode < 37 && evt.keyCode > 40) {
                activecommand = input.value;
            }
            
            $("#txtarea").height($("#txtarea")[0].scrollHeight - 1);
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1);
        });
        
        $("#txtarea").click(function(event) {
            event.stopPropagation();
        });
            
        input.addEventListener("blur", function(e) {
            if (tastaRcommand == "enter") {
                
                if (input.value.slice(0, 1) == "\n") {
                    input.value = input.value.slice(1);
                }
                
                input.value = input.value.replace(/\r\n?/g, '\n');
                
                history[(histindex < history.length)?history.length:histindex] = input.value;
                histindex = history.length;
                
                var test = parseCommand(tempcommand + input.value);
                
                if (test == "ok") {
                    if (input.value.slice(0, 1) == "\n") {
                        input.value = input.value.slice(1);
                    }
                    
                    var sequence = input.value.split("\n");
                    var fromto = [[0, 0]]; 
                    if (sequence.length > 1) {
                        var fromtoline = 0;
                        var check = rep(false, sequence.length)
                        
                        while (!all(check, " == true")) {
                            for (var i = fromto[fromtoline][0]; i < sequence.length; i++) {
                                check[i] = true;
                                test = parseCommand(paste(sequence, fromto[fromtoline][0], i, ";"), brackets = false)
                                if (test == "ok") {
                                    fromto[fromtoline][1] = i;
                                    fromtoline += 1;
                                    if (!all(check, " == true")) {
                                        fromto[fromtoline] = new Array(2);
                                        fromto[fromtoline][0] = i + 1;
                                    }
                                }
                            }
                        }
                    }
                    
                    Rcommand.counter = 1 - Rcommand.counter;
                    Rcommand.command = tempcommand + input.value;
                    Rcommand.brackets = fromto;
                    Rcommand.thinfo = thinfo; 
                    
                    string_command = input.value;
                    outres = new Array();
                    outres.result = "listen2R";
                    Shiny.onInputChange("Rcommand", Rcommand);
                    
                    updatecounter = 0;
                    printRcommand();
                    
                    $("#tempdiv").remove();
                    input.remove();
                }
                else if (test == "+") {
                    
                    tempcommand += input.value;
                    
                    var header = strwrap(input.value, 74, "  ");
                    
                    $("#tempdiv").remove();
                    $("#result_main").append("<span style='color:#932192'>" + ((prompt == ">")?">":"+") + " </span><span style='color:blue'>" + header + "</span><br>");
                    
                    input.remove();
                    
                    createCommandPromptInRconsole(test);
                    
                    $("#tempdiv").click();
                    
                }
            }
            else if (tastaRcommand == "escape") {
                input.remove();
                
                $("#tempdiv").remove();
                $("#result_main").append("<span style='color:#932192'>" + ((tempcommand == "")?">":"+") + " </span><br><br>");
                tempcommand = "";
                createCommandPromptInRconsole(test);
                $("#tempdiv").click();
                
            }
            else {
                input.remove();
                
                $("#tempdiv").css({"border-color": "#b4d395", 
                                   "border-width": "1px", 
                                   "border-style": "solid"});
            }
            
            activecommand = "";
            tastaRcommand = "";
        });
        
        input.focus();
        
    });
}

function console_command(type) {
    
    current_command = type;
    string_command = "";
    objname = "";
    
    if (type == "import") {
        
        if (dirfile.filepath != "") {
            
            string_command = ((read_table.filename != "")?read_table.filename:dirfile.filename) + " <- ";
            if (read_table.sep == ",") {
                string_command = string_command + "read.csv(\"" + 
                
                dirfile.filepath[0][0].replace(/\s/g, "≠") + "\"" + 
                (!read_table.header?", header = FALSE":"") + 
                ((read_table.dec == ",")?", dec = \",\"":"");
            }
            else {
                string_command = string_command + "read.table(\"" + 
                dirfile.filepath[0][0].replace(/\s/g, "≠") + "\", sep = \"" +
                ((read_table.sep == "tab")?"\\t":read_table.sep) + "\"" +
                (read_table.header?", header = TRUE":"") + 
                ((read_table.dec == ",")?", dec = \",\"":"");
            }
            
            string_command = string_command +
            (
                (read_table.row_names.length == 0)?")":(
                    ", row.names = " + (
                        (read_table.row_names % 2 >= 0)?(read_table.row_names + ")"):("\"" + read_table.row_names + "\")")
                    )
                )
            );
        }
    }
    else {
        
        if (datainfo.rownames != "" && imported_filename != "" && !dirfilist.refresh) {
            
            if (type == "export") {
                if (exportobj.filename != "") {
                    string_command = "export(" + ((read_table.filename != "")?read_table.filename:imported_filename) + ", file = ";
                    
                    if (exportobj.newfile) {
                        string_command += "\"" + (dirfile.wd + "/" + exportobj.filename).replace(/\s/g, "≠") + "\"";
                    }
                    else {
                        string_command += "\"" + (dirfile.wd + "/" + exportobj.filename).replace(/\s/g, "≠") + "\"";
                    }
                    
                    if (exportobj.sep != ",") {
                        string_command += ", sep = \"" + ((exportobj.sep == "tab")?"\\t":exportobj.sep) + "\"";
                    }
                    
                    if (!exportobj.header) {
                        string_command += ", col.names = FALSE";
                    }
                    else {
                        if (exportobj.caseid != "cases") {
                            string_command += ", caseid = \"" + exportobj.caseid + "\"";
                        }
                    }
                    
                    string_command += ")"
                }
            }
            
            if (type == "eqmcc") {
                
                var outcome = getTrueKeys(colclicks.eqmcc.outcome);
                var conditions = getTrueKeys(colclicks.eqmcc.conditions);
                objname <- "qmc";
                string_command = "eqmcc(" + ((read_table.filename != "")?read_table.filename:imported_filename);
                
                if (outcome.length > 0) {
                    string_command += ", outcome = \"";
                    
                    if (eqmcc.neg_out) {
                        string_command += "~";
                    }
                    
                    for (var i = 0; i < outcome.length; i++) {
                        string_command += outcome[i] + ((i == outcome.length - 1)?"\"":", ");
                    }
                }
                
                if (conditions.length > 0) {
                    
                    string_command += ", conditions = \"";
                    
                    for (var i = 0; i < conditions.length; i++) {
                        string_command += conditions[i] + ((i == conditions.length - 1)?"\"":", ");
                    }
                }
                
                if (eqmcc.relation != "suf") {
                    string_command += ", relation = \"sufnec\"";
                }
                
                if (eqmcc.n_cut != "1") {
                    string_command += ", n.cut = " + eqmcc.n_cut;
                }
                
                if (eqmcc.ic1 != "1") {
                    if (eqmcc.ic0 == "") {
                        string_command += ", incl.cut = " + eqmcc.ic1;
                    }
                    else {
                        string_command += ", incl.cut = \"" + eqmcc.ic1 + ", " + eqmcc.ic0 + "\"";
                    }
                }
                
                if (eqmcc.explain.length > 0) {
                    
                    if (eqmcc.explain.length == 1) {
                        if (eqmcc.explain[0] != "1") {
                            string_command += ", explain = \"" + eqmcc.explain + "\"";
                        }
                    }
                    else {
                        string_command += ", explain = \"";
                        for (var i = 0; i < eqmcc.explain.length; i++) {
                            string_command += eqmcc.explain[i] + ((i == eqmcc.explain.length - 1)?"\"":", ");
                        }
                    }
                }
                
                if (eqmcc.include.length > 0) {
                    string_command += ", include = \"";
                    
                    for (var i = 0; i < eqmcc.include.length; i++) {
                        string_command += eqmcc.include[i] + ((i == eqmcc.include.length - 1)?"\"":", ");
                    }
                }
                
                if (eqmcc.row_dom) {
                    string_command += ", row.dom = TRUE";
                }
                
                if (eqmcc.all_sol) {
                    string_command += ", all.sol = TRUE";
                }
                
                if (eqmcc.dir_exp.length > 0) {
                    var alldash = true;
                    for (var i = 0; i < eqmcc.dir_exp.length; i++) {
                        if (eqmcc.dir_exp[i] != "-") {
                            alldash = false;
                        }
                    }
                    if (!alldash) {
                        string_command += ", dir.exp = \"";
                        for (var i = 0; i < eqmcc.dir_exp.length; i++) {
                            string_command += eqmcc.dir_exp[i] + ((i < eqmcc.dir_exp.length - 1)?",":"");
                        }
                        string_command += "\"";
                    }
                }
                
                if (eqmcc.details) {
                    string_command += ", details = TRUE";
                }
                
                if (eqmcc.show_cases) {
                    string_command += ", show.cases = TRUE";
                }
                
                if (eqmcc.use_tilde) {
                    string_command += ", use.tilde = TRUE";
                }
                
                if (eqmcc.use_letters) {
                    string_command += ", use.letters = TRUE";
                }
                
                string_command += ")";
                
            }
            
            if (type == "tt") {
                
                var outcome = getTrueKeys(colclicks.tt.outcome);
                var conditions = getTrueKeys(colclicks.tt.conditions);
                objname = "tt";
                
                string_command = objname + " <- " + "truthTable(" + ((read_table.filename != "")?read_table.filename:imported_filename);
                
                if (outcome.length > 0) {
                    string_command += ", outcome = \"";
                    
                    if (tt.neg_out) {
                        string_command += "~";
                    }
                    
                    string_command += outcome + "\"";
                }
                
                if (conditions.length > 0) {
                    
                    string_command += ", conditions = \""
                    
                    for (var i = 0; i < conditions.length; i++) {
                        string_command += conditions[i] + ((i == conditions.length - 1)?"\"":", ");
                    }
                }
                
                if (tt.n_cut != "1") {
                    string_command += ", n.cut = " + tt.n_cut;
                }
                
                if (tt.ic1 != "1") {
                    if (tt.ic0 == "") {
                        string_command += ", incl.cut = " + tt.ic1;
                    }
                    else {
                        string_command += ", incl.cut = \"" + tt.ic1 + ", " + tt.ic0 + "\"";
                    }
                }
                
                if (tt.complete) {
                    string_command += ", complete = TRUE";
                }
                
                if (tt.show_cases) {
                    string_command += ", show.cases = TRUE";
                }
                
                var sorts = getTrueKeys(tt.sort_sel);
                
                if (sorts.length > 0) {
                    
                    string_command += ", sort.by = \"";
                    
                    for (var i = 0; i < sorts.length; i++) {
                        string_command += sorts[i] +
                                          ((tt.sort_by[sorts[i]])?"":"+") +
                                          ((i == sorts.length - 1)?"\"":", ");
                    }
                }
                
                if (tt.use_letters) {
                    string_command += ", use.letters = TRUE";
                }
                
                string_command += ")";
                
            }
            
            if (type == "calibrate") {
                
                var col = (getKeys(colclicks).indexOf("calibrate") >= 0)?getTrueKeys(colclicks.calibrate.x):"";
                
                if (col.length > 0) { 
                    if (!calibrate.same && calibrate.newvar != "") {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + calibrate.newvar;
                    }
                    else {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col;
                    }
                    
                    string_command += " <- calibrate(" + ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col;
                    
                    if (calibrate.type == "fuzzy") {
                        string_command += ", type = \"fuzzy\"";
                    }
                    
                    if (calibrate.thresholds.length > 0) {
                        
                        var valid = new Array();
                        for (var i = 0; i < calibrate.thresholds.length; i++) {
                            if (calibrate.thresholds[i] != "" && calibrate.thresholds[i] != void 0) {
                                valid.push(i);
                            }
                        }
                        
                        if (valid.length > 0) {
                            if (valid.length == 1) {
                                if (calibrate.type == "crisp") {
                                   string_command += ", thresholds = " + calibrate.thresholds[valid[0]];
                                }
                            }
                            else {
                                if (calibrate.type == "crisp") {
                                    string_command += ", thresholds = c(";
                                    for (var i = 0; i < valid.length; i++) {
                                        string_command += calibrate.thresholds[valid[i]] + ((i < valid.length - 1)?", ":")");
                                    }
                                }
                                else {
                                    if ((valid.length == 3 && calibrate.thnames[0].substring(1, 2) != "1") || valid.length == 6) {
                                        string_command += ", thresholds = \"";
                                        for (var i = 0; i < valid.length; i++) {
                                            string_command += (calibrate.thnames[valid[i]] + "=") + calibrate.thresholds[valid[i]] + ((i == valid.length - 1)?"\"":", ");
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if (calibrate.type == "crisp") {
                        if (!calibrate.include) {
                            string_command += ", include = FALSE";
                        }
                    }
                    
                    if (calibrate.type == "fuzzy") {
                        if (calibrate.end) {
                            if (!calibrate.logistic) {
                                string_command += ", logistic = FALSE";
                                if (calibrate.ecdf) {
                                    string_command += ", ecdf = TRUE";
                                }
                            }
                            else if (calibrate.idm != "0.95") {
                                string_command += ", idm = " + calibrate.idm;
                            }
                        }
                    }
                    
                    if (calibrate.above != "1") {
                        string_command += ", above = " + calibrate.above;
                    }
                    
                    if (calibrate.below != "1") {
                        string_command += ", below = " + calibrate.below;
                    }
                    
                    string_command += ")";
                    
                }
                else {
                    string_command = "";
                }
            }
            
            if (type == "recode") {
                
                var col = (getKeys(colclicks).indexOf("recode") >= 0)?getTrueKeys(colclicks.recode.x):"";
                
                var uniques = unique(recode.newv);
                
                if (col.length > 0 && uniques.length > 0) {
                    
                    if (!recode.same && recode.newvar != "") {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + recode.newvar;
                    }
                    else {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col;
                    }
                    
                    string_command += " <- recode(" + ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col + ", \"";
                    
                    var nl = recode.newv.length; 
                    var temp, oldvals;
                    for (var i = 0; i < uniques.length; i++) {
                        temp = new Array();
                        oldvals = "";
                        
                        for (var j = 0; j < nl; j++) {
                            if (recode.newv[j] == uniques[i]) {
                                temp.push(recode.oldv[j]);
                            }
                        }
                        for (j = 0; j < temp.length; j++) {
                            oldvals += temp[j] + ((j < temp.length - 1)?",":"")
                        }
                        
                        string_command += oldvals + "=" + uniques[i] + ((i < uniques.length - 1)?"; ":"");
                        
                    }
                    
                    string_command += "\")";
                }
                else {
                    string_command = "";
                }
                
            }
            
        }
    }
    
    string_command = string_command.replace("csv(", "£");
    string_command = string_command.replace("table(", "§");
    string_command = string_command.replace(/\s/g, "∞");
    
    var crev = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
    $("#command_main").html(strwrap(string_command, 78).replace(/£|§|∞|≠/g, function(x) {return crev[x]}));
}

function print_cols(paper, options) {
                                
    var dialog = options.dialog;
    var identifier = options.identifier;
    var selection = options.selection;
    var cols = options.cols;
    var selectable = options.selectable;
    var numerics = options.numerics;
    var calibrated = options.calibrated;
    var grey;
    
    paper.clear();
    if (cols.length > 0) {
        
        if (selection == void 0) {
            selection = "single";
        }
        
        if (getKeys(colclicks).indexOf(dialog) < 0) {
            colclicks[dialog] = new Array();
        }
        
        if (getKeys(colclicks[dialog]).indexOf(identifier) < 0) {
            colclicks[dialog][identifier] = new Array(cols.length);
            for (var i = 0; i < cols.length; i++) {
                colclicks[dialog][identifier][cols[i]] = false;
            }
        }
        else {
            
            for (var i = 0; i < cols.length; i++) {
                if (getKeys(colclicks[dialog][identifier]).indexOf(cols[i]) < 0) {
                    colclicks[dialog][identifier][cols[i]] = false;
                }
            }
        }
        
        canvas_height = cols.length * 20;
        
        var rects_back = new Array(cols.length);
        var texts = new Array(cols.length);
        var rects = new Array(cols.length);
        var clicks = [-1, -1];
        
        if (selection == "none") {
            
            var colset = paper.set();
            
            if (Array.isArray(cols)) {
                for (var i = 0; i < cols.length; i++) {
                    colset.push(sat(paper.text(10, 10 + i*20, cols[i])));
                }
            }
            else {
                colset.push(sat(paper.text(10, 11, cols)));
            }
            
            var colsetbox = colset.getBBox();
            
            $(paper.canvas).width(colsetbox.width + 20);
            
            canvas_height = colsetbox.height + 4.5;
            
        }
        else {
                if (datainfo.rownames != "") { 
                
                for (var i = 0; i < cols.length; i++) {
                    rects_back[i] = paper.rect(0, i*20 + 0.5, 220, 19).attr({fill: colclicks[dialog][identifier][cols[i]]?"#79a74c":"#ffffff", stroke: "none"});
                    texts[i] = paper.text(10, 10 + i*20, cols[i]).attr({"text-anchor": "start", "font-size": "14px", fill: colclicks[dialog][identifier][cols[i]]?"white":"black"});
                    
                    opacity = 0;
                    if (selectable.indexOf("numerics") >= 0) {
                        if (!numerics[i]) {
                            opacity = 0.3;
                        }
                    }
                    
                    if (selectable.indexOf("calibrated") >= 0) {
                        if (!calibrated[i]) {
                            opacity = 0.3;
                        }
                    }
                    
                    rects[i] = paper.rect(0, i*20, 220, 20).attr({fill: "#333333", stroke: "none", "fill-opacity": opacity});
                    rects[i].selectable = (opacity == 0);
                    rects[i].click(function(event) {
                        if (selection == "multiple") {
                            if (event.shiftKey) {
                                                            
                                if (clicks[0] > -1) {
                                    var x1 = clicks[0];
                                    var x2 = this.id;
                                    if (x1 > x2) {
                                        x1 = this.id;
                                        x2 = clicks[0];
                                    }
                                    
                                    var firstvar = rects[clicks[0]].name;
                                    for (var k = x1; k < x2 + 1; k++) {
                                        rects_back[k].attr({fill: colclicks[dialog][identifier][firstvar]?"#79a74c":"#ffffff", stroke: "none"});
                                        texts[k].attr({"text-anchor": "start", "font-size": "14px", fill: colclicks[dialog][identifier][firstvar]?"white":"black"});
                                        colclicks[dialog][identifier][rects[k].name] = colclicks[dialog][identifier][firstvar];
                                        
                                    }
                                    
                                }
                                else {
                                    clicks[0] = this.id;
                                    rects_back[this.id].attr({fill: "#79a74c", stroke: "none"});
                                    texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: "white"});
                                    colclicks[dialog][identifier][this.name] = true;
                                    if (dialog == "recode") {
                                        checkRecodeSelections(colclicks, papers["recode_main"]);
                                    }
                                    
                                }
                                
                            }
                            else { 
                                
                                clicks[0] = this.id;
                                colclicks[dialog][identifier][this.name] = !colclicks[dialog][identifier][this.name];
                                
                                rects_back[this.id].attr({fill: colclicks[dialog][identifier][this.name]?"#79a74c":"#ffffff", stroke: "none"});
                                texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: colclicks[dialog][identifier][this.name]?"white":"black"});
                                
                                if (dialog == "recode") {
                                    checkRecodeSelections(colclicks, papers["recode_main"]);
                                }
                                
                            }
                            
                            if (dialog == "eqmcc") {
                                filldirexp();
                            }
                            
                            console_command(dialog);
                            
                        }
                        else if (selection == "single") {
                            
                            if (this.selectable) {
                                if (!colclicks[dialog][identifier][this.name]) {
                                    for (var k = 0; k < cols.length; k++) {
                                        rects_back[k].attr({fill: "#ffffff", stroke: "none"});
                                        texts[k].attr({"text-anchor": "start", "font-size": "14px", fill: "black"});
                                        colclicks[dialog][identifier][rects[k].name] = false;
                                    }
                                    
                                    colclicks[dialog][identifier][this.name] = true;
                                    rects_back[this.id].attr({fill: "#79a74c", stroke: "none"});
                                    texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: "white"});
                                    
                                    if (dialog == "calibrate") {
                                        
                                        calibrate.x[0] = this.name;
                                        thinfo.condition = this.name;
                                        
                                        for (var i = 0; i < calibrate.thresholds.length; i++) {
                                            ths[i].attr({"text": ""});
                                            calibrate.thresholds[i] = "";
                                        }
                                        
                                        updatecounter = 0;
                                        poinths.message = "noresponse";
                                        thinfo.counter = 1 - thinfo.counter; 
                                        Shiny.onInputChange("thinfo", thinfo);
                                        doWhenDataPointsAreReturned();
                                        
                                    }
                                    else if (dialog == "xyplot") {
                                        xyplot[identifier] = this.name;
                                        
                                        if (xyplot.x != "" && xyplot.y != "") {
                                            
                                            updatecounter = 0;
                                            xyplot.counter += 1;
                                            lastvals = xyplotdata;
                                            
                                            Shiny.onInputChange("xyplot", xyplot);
                                            doWhenXYplotPointsAreReturned();
                                            
                                        }
                                        
                                    }
                                    
                                }
                                else {
                                    colclicks[dialog][identifier][this.name] = false;
                                    rects_back[this.id].attr({fill: "#ffffff", stroke: "none"});
                                    texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: "black"});
                                    
                                    if (dialog == "calibrate") {
                                        
                                        for (var i = 0; i < calibrate.thresholds.length; i++) {
                                            ths[i].attr({"text": ""});
                                            calibrate.thresholds[i] = "";
                                        }
                                        
                                        thsetter_content.remove();
                                    }
                                    
                                }
                                
                                console_command(dialog);
                            }
                            
                        }
                        
                    });
                    
                    rects[i].id = i;
                    rects[i].name = cols[i];
                }
            }
            else {
                canvas_height = 0;
            }
        }
        $(paper.canvas).height(canvas_height);
    }
}

function strwrap(str, width, prefix) {
    prefix = void 0==prefix?"":prefix;
    
    if (str.length > width) {
        var q = 0;
        for (var p = width; p > 1; p--) {
            if (["£", "§", "∞"].indexOf(str[p]) >= 0 && q == 0) {
                q = p;
            }
        }
        
        if (q > 0) {
            var left = str.substring(0, q + (str[q] != "∞"));
            var right = prefix + str.substring(q + 1);
            
            return (left + "<br>" + strwrap(right, width, prefix));
        }
        else {
            
            var q = 0;
            for (var p = 1; p < str.length; p++) {
                if (["£", "§", "∞"].indexOf(str[p]) >= 0 && q == 0) {
                    q = p;
                }
            }
            
            if (q > 0) {
                var left = str.substring(0, q + (str[q] != "∞"));
                var right = prefix + str.substring(q + 1);
                
                return (left + "<br>" + strwrap(right, width, prefix));
            }
            else {
                return (str)
            }
        }
    }
    
    return (str);
}

function getTextWidth(string) {
    var paper = Raphael(0, 0, 0, 0);
        paper.canvas.style.visibility = "hidden";
    
    var BBox = sat(paper.text(0, 0, string)).getBBox();
    
    paper.remove();
    return BBox.width;
}

function getTrimmedText(text, width) {
    var temp = "";
    var stop = false;
    for (var i = 0; i < text.length; i++) {
        if (getTextWidth(temp + text[i]) <= width) {
            temp += stop?"":text[i];
        }
        else {
            stop = true;
        }
    }
    
    return(temp + "...");
}

function print_data() {
    
    if ($("#data_editor").length) {
        if (papers["data_topleft"].constant == void 0) {
            papers["data_topleft"].constant = papers["data_topleft"].rect(0, 0, 70, 20).attr({fill: "#f2f2f2", stroke: "#d7d7d7", "fill-opacity": 1});
            papers["data_topleft"].colsrect = -100;
            papers["data_topleft"].colsrect_show = false;
            papers["data_topleft"].rowsrect = -100;
            papers["data_topleft"].rowsrect_show = false;
            papers["data_topleft"].bodyrect = [-100, -100];
            papers["data_topleft"].bodyrect_show = false;
        }
        
        papers["data_topleft"].constant.attr({"fill-opacity": 1, "stroke": "#d7d7d7"})
        
        if (theData != "" && datainfo.rownames != "error!") {
            papers["data_body"    ].setSize(70*datainfo.ncols, 20*datainfo.nrows);
            papers["data_rownames"].setSize(70               , 20*datainfo.nrows);
            papers["data_colnames"].setSize(70*datainfo.ncols, 20);
        }
        else {
            papers["data_body"    ].setSize(70*8, 20*17);
            papers["data_rownames"].setSize(70  , 20*17);
            papers["data_colnames"].setSize(70*8, 20   );
        }
            update_data();
        
    }
}

function update_data() {
    
    if ($("#data_editor").length) {
        papers["data_colnames"].clear();
        papers["data_rownames"].clear();
        papers["data_body"].clear();
        
        var Xshift = Math.floor($("#data_body").scrollLeft()/70);
        var Yshift = Math.floor($("#data_body").scrollTop()/20);
        
        var temp, tocompare, textToPrint, tobe, temprect;
        
        var bodyrect = papers["data_body"].rect(-100, 0, 70, 20);
        var colsrect = papers["data_body"].rect(-100, 0, 70, 20);
        var rowsrect = papers["data_body"].rect(-100, 0, 70, 20);
        
        var bodygridtext = "", colgridtext = "", rowgridtext = "";
        
        papers["data_colnames"].rect(70*(Xshift - 25), 0, 70*(Xshift + 60), 20)
        .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
        
        papers["data_rownames"].rect(0, 20*(Yshift - 50), 70, 20*(Yshift + 120))
        .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
        
        for (var i = Xshift - 25; i < Xshift + 60; i++) { 
            
            bodygridtext += "M" + 70*i + "," + 20*(Yshift - 50) + "L" + 70*i + "," + 20*(Yshift + 120);
            colgridtext += "M" + 70*i + ",0 L" + 70*i + ",20";
            
        }
        
        for (var i = Yshift - 50; i < Yshift + 120; i++) { 
            
            bodygridtext += "M" + 70*(Xshift - 25) + "," + 20*i + "L" + 70*(Xshift + 60) + "," + 20*i;
            papers["data_rownames"].path("M" + 0 + "," + 20*i + "L 70" + "," + 20*i).attr({stroke: "#d7d7d7"});
        }
        
        gridset = papers["data_body"].path(bodygridtext).attr({stroke: "#d7d7d7"});
        papers["data_colnames"].path(colgridtext).attr({stroke: "#d7d7d7"});
        
        var getCoords = function(event) {
            
            var scrollX = $("#data_body").scrollLeft()%70;
            var scrollY = $("#data_body").scrollTop()%20;
            
            var mouseX = Math.floor((event.clientX + $(window).scrollLeft() - testX - 70 + scrollX)/70);
            var mouseY = Math.floor((event.clientY + $(window).scrollTop() - 3*(navigator.browserType == "Firefox") - testY - 40 + scrollY)/20);
            
            var Xshift = Math.floor($("#data_body").scrollLeft()/70);
            var Yshift = Math.floor($("#data_body").scrollTop()/20);
            
            var mX = mouseX - Math.round(scrollX/70);
            var mY = mouseY - Math.round(scrollY/20);
            
            return({
                "mX": mX,
                "mY": mY,
                "mouseX": mouseX,
                "mouseY": mouseY,
                "scrollX": scrollX,
                "scrollY": scrollY,
                "Xshift": Xshift,
                "Yshift": Yshift
            });
        }
        
        if (theData != "" && datainfo.rownames != "error!") {
            for (var i = 0; i < scrollvh[3] + 1; i++) {
                sat(papers["data_colnames"].text(5 + 70*(i + scrollvh[1]), 10, datainfo.colnames[i + scrollvh[1]]),
                    {"clip": (70*(i + scrollvh[1])) + ", 0, 68, 20"});
            }
            
            for (var j = 0; j < scrollvh[2] + 1; j++) { 
                 sat(papers["data_rownames"].text(5, 10 + 20*(j + scrollvh[0]), datainfo.rownames[j + scrollvh[0]]),
                    {"clip": "0, " + 20*(j + scrollvh[0]) + ", 68, 20"});
            }
            
            for (i = 0; i < theData.length; i++) {
                for (j = 0; j < theData[0].length; j++) {
                    if (theData[i][j] != undefined) {
                        sat(papers["data_body"].text(5 + 70*(i + scrollvh[1]), 10 + 20*(j + scrollvh[0]), ("" + theData[i][j])), 
                            {"clip": 70*(i + scrollvh[1]) + ", " + 20*(j + scrollvh[0]) + ", 68, 20"});
                    }
                    else {
                        papers["data_body"].text(5 + 70*(i + scrollvh[1]), 10 + 20*(j + scrollvh[0]), "");
                    }
                    
                }
            }
        
            var colnamescover = papers["data_colnames"].rect(0, 0, 70*datainfo.ncols, 20)
            .attr({fill: "#ffffff", stroke: "none", "fill-opacity": 0})
            .click(function(event) {
                var coords = getCoords(event);
                bodyrect.hide();
                rowsrect.hide();
                colsrect.remove();
                papers["data_topleft"].bodyrect_show = false;
                papers["data_topleft"].rowsrect_show = false;
                papers["data_topleft"].colsrect_show = true;
                
                colsrect = papers["data_colnames"].rect(70*(coords.mouseX + coords.Xshift) + 1, 1, 68, 18).attr({"stroke-width": 1.3});
                papers["data_topleft"].colsrect = 70*(coords.mouseX + coords.Xshift) + 1;
            })
            .dblclick(function(event) {
                
                var coords = getCoords(event);
                colsrect.hide();
                
                temp = datainfo.colnames[coords.mouseX + coords.Xshift];
                
                tobe = sat(papers["data_colnames"].text(0, 0, temp));
                
                papers["data_colnames"].inlineTextEditing(tobe);
                
                input = tobe.inlineTextEditing.startEditing(
                    70*coords.mouseX - coords.scrollX + 70, 
                    20 - 1*(navigator.browserType == "Firefox"), 
                    70, 
                    20,
                    "from_data_editor",
                    "#f2f2f2");
                
                input.cover = this;
                input.addEventListener("blur", function(e) {
                    
                    tobe.inlineTextEditing.stopEditing(tasta);
                    
                    tocompare = tobe.attr("text");
                    
                    if (temp != tocompare) {
                        
                        colclicks = changeCol(colclicks, temp, tocompare);
                        datainfo.colnames[coords.mouseX + coords.Xshift] = tocompare;
                        
                        dataModif.row = null;
                        dataModif.col = coords.mouseX + coords.Xshift + 1;
                        dataModif.val = tocompare;
                        
                        Shiny.onInputChange("dataModif", dataModif);
                        
                        refresh_cols("exclude", "import");
                        
                        console_command(current_command);
                        
                        if ($("#xyplot").length) {
                            
                            if (xyplot.x == temp) {
                                xyplot.x = tocompare;
                            }
                            
                            if (xyplot.y == temp) {
                                xyplot.y = tocompare;
                            }
                            
                            draw_xyplot(papers["xyplot_main"]);
                        }
                        
                        papers["data_colnames"].rect(70*(coords.mouseX + coords.Xshift), 0, 70, 20)
                        .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
                        
                        sat(papers["data_colnames"].text(5 + 70*(coords.mouseX + coords.Xshift), 10, tocompare),
                            {"clip": 70*(coords.mouseX + coords.Xshift) + ", 0, 68, 20"});
                        
                    }
                    
                    tobe.remove();
                    input.cover.toFront();
                    tasta = "enter";
                    
                });
                
                colsrect.show();
                colsrect.toFront();
            });
            
            var rownamescover = papers["data_rownames"].rect(0, 0, 70, 20*datainfo.nrows)
            .attr({fill: "#ffffff", stroke: "none", "fill-opacity": "0"})
            .click(function(event) {
                var coords = getCoords(event);
                
                bodyrect.hide();
                rowsrect.remove();
                colsrect.hide();
                papers["data_topleft"].bodyrect_show = false;
                papers["data_topleft"].rowsrect_show = true;
                papers["data_topleft"].colsrect_show = false;
                
                rowsrect = papers["data_rownames"].rect(1, 20*(coords.mouseY + coords.Yshift) + 1, 68, 18).attr({"stroke-width": 1.3});  
                papers["data_topleft"].rowsrect = 20*(coords.mouseY + coords.Yshift) + 1;
            })
            .dblclick(function(event) {
                
                var coords = getCoords(event);
                rowsrect.hide();
                
                temp = datainfo.rownames[coords.mouseY + coords.Yshift];
                
                tobe = sat(papers["data_rownames"].text(0, 0, temp));
                
                papers["data_rownames"].inlineTextEditing(tobe);
                
                input = tobe.inlineTextEditing.startEditing(
                    0,
                    20*coords.mouseY - coords.scrollY + 20 + 20 - 1*(navigator.browserType == "Firefox"), 
                    70, 
                    20,
                    "whatever",
                    "#f2f2f2");
                
                input.cover = this;
                input.addEventListener("blur", function(e) {
                        
                    tobe.inlineTextEditing.stopEditing(tasta);
                    tocompare = tobe.attr("text");
                    
                    if (temp != tocompare) {
                        datainfo.rownames[coords.mouseY + coords.Yshift] = tocompare;
                        
                        dataModif.row = coords.mouseY + coords.Yshift + 1;
                        dataModif.col = null;
                        dataModif.val = tocompare;
                        
                        Shiny.onInputChange("dataModif", dataModif);
                        
                        if ($("#xyplot").length) {
                            if (xyplotdata.length > 0) {
                                xyplotdata[0][xyplotdata[0].indexOf(temp)] = tocompare;
                                draw_xyplot(papers["xyplot_main"]);
                            }
                        }
                        
                        papers["data_rownames"].rect(0, 20*(coords.mouseY + coords.Yshift), 70, 20)
                        .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
                        
                        sat(papers["data_rownames"].text(5, 10 + 20*(coords.mouseY + coords.Yshift), tocompare).toFront(),
                            {"clip": "0, " + 20*(coords.mouseY + coords.Yshift) + ", 68, 20"});
                        
                    }
                    
                    tobe.remove();
                    input.cover.toFront();
                    tasta = "enter";
                })
                
                rowsrect.show();
                rowsrect.toFront();
            })
            
            var datacover = papers["data_body"].rect(0, 0, 70*datainfo.ncols, 20*datainfo.nrows)
            .attr({fill: "#aedaca", stroke: "none", "fill-opacity": 0})
            .click(function(event) {
                var coords = getCoords(event);
                bodyrect.remove();
                rowsrect.hide();
                colsrect.hide();
                papers["data_topleft"].bodyrect_show = true;
                papers["data_topleft"].rowsrect_show = false;
                papers["data_topleft"].colsrect_show = false;
                
                bodyrect = papers["data_body"].rect(70*(coords.mouseX + coords.Xshift) + 1, 20*(coords.mouseY + coords.Yshift) + 1, 68, 18)
                .attr({"stroke-width": 1.3});
                papers["data_topleft"].bodyrect[0] = 70*(coords.mouseX + coords.Xshift) + 1;
                papers["data_topleft"].bodyrect[1] = 20*(coords.mouseY + coords.Yshift) + 1;
            })  
            .dblclick(function(event) {
                var coords = getCoords(event);
                
                bodyrect.hide();
                
                temp = "" + theData[coords.mX][coords.mY];
                temp = (temp == "null")?"":temp;
                
                tobe = sat(papers["data_body"].text(0, 0, temp));
                
                papers["data_body"].inlineTextEditing(tobe);
                
                input = tobe.inlineTextEditing.startEditing(
                    70*coords.mouseX - coords.scrollX + 70 + 1, 
                    20*coords.mouseY - coords.scrollY + 20 + 20 + 1 - 1*(navigator.browserType == "Firefox"), 
                    70, 
                    20 - 2);
                
                input.addEventListener("blur", function(e) {
                    tobe.inlineTextEditing.stopEditing(tasta);
                    tocompare = tobe.attr("text");
                    
                    if (temp != tocompare) {
                        
                        if (!isNaN(tocompare) && tocompare !== "") {
                            tocompare = 1*tocompare;
                        }
                        
                        theData[coords.mX][coords.mY] = tocompare;
                        
                        dataModif.row = coords.mouseY + coords.Yshift + 1;
                        dataModif.col = coords.mouseX + coords.Xshift + 1;
                        dataModif.val = tocompare;
                        
                        Shiny.onInputChange("dataModif", dataModif);
                        
                        papers["data_body"].rect(70*(coords.mouseX + coords.Xshift), 20*(coords.mouseY + coords.Yshift), 70, 20)
                        .attr({fill: "#ffffff", stroke: "none"});
                        
                        sat(papers["data_body"].text(5 + 70*(coords.mouseX + coords.Xshift), 10 + 20*(coords.mouseY + coords.Yshift), tocompare));
                        
                        if ($("#calibrate").length) {
                            
                            updatecounter = 0;
                            poinths.message = "noresponse";
                            thinfo.counter = 1 - thinfo.counter; 
                            Shiny.onInputChange("thinfo", thinfo);
                            doWhenDataPointsAreReturned();
                        }
                        
                        if ($("#xyplot").length) {
                            
                            updatecounter = 0;
                            xyplot.counter += 1;
                            lastvals = xyplotdata;
                            
                            Shiny.onInputChange("xyplot", xyplot);
                            doWhenXYplotPointsAreReturned();
                        }
                    }
                    
                    tobe.remove();
                    gridset.toFront();
                    bodyrect.show();
                    bodyrect.toFront();
                    datacover.toFront();
                    tasta = "enter";
                    
                });
                
            });
        }
        
        gridset.toFront();
        if (theData != "" && datainfo.rownames != "error!") {
            datacover.toFront();
        }
        
        if (papers["data_topleft"].rowsrect_show) {
            rowsrect = papers["data_rownames"].rect(1, papers["data_topleft"].rowsrect, 68, 18).attr({"stroke-width": 1.3});
        }
        
        if (papers["data_topleft"].colsrect_show) {
            colsrect = papers["data_colnames"].rect(papers["data_topleft"].colsrect, 1, 68, 18).attr({"stroke-width": 1.3});
        }
        
        if (papers["data_topleft"].bodyrect_show) {
            bodyrect = papers["data_body"].rect(papers["data_topleft"].bodyrect[0], papers["data_topleft"].bodyrect[1], 68, 18).attr({"stroke-width": 1.3});
        }
    }
}

function refresh_dirs() {
    
    dirsfilescopy = "";
            
    if (dirfile.dirs != null) {
        dirsfilescopy += dirfile.dirs.toString();
    }
    
    if (dirfile.files != null) {
        dirsfilescopy += dirfile.files.toString();
    }
    
    dirfilevisit = true;
    print_dirs();
    
    updatecounter = 0;
    
    dirfilist.value = 1 - dirfilist.value;
    Shiny.onInputChange("dirfilist", dirfilist);
    printIfDirsFilesChange();
    
}

function draw_import(paper) {
    
    paper.clear();
    
    var stx = 13;
    var sty = 10;
    
    sat(paper.text(stx + 5, sty + 15, "Separator:"));
    
    var radios = paper.radio(stx + 11, sty + 40, 0, ["comma", "space", "tab", "other, please specify:"]);
    
    radios.cover[0].click(function() {
        read_table.sep = ",";
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    radios.cover[1].click(function() {
        read_table.sep = " ";
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    radios.cover[2].click(function() {
        read_table.sep = "tab";
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    radios.cover[3].click(function() {
        read_table.sep = other.attr("text");
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    var other = sat(paper.text(stx + 170, sty + 116, ""),
                    {"clip": (stx + 165) + ", " + (sty + 106) + ", 35, 20"});
    var other_rect = paper.rect(stx + 165, sty + 106, 37, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
    paper.inlineTextEditing(other);
    
    var other_clicked = false;
    
    other_rect.click(function(e) {
        var me = this;
        e.stopPropagation();
        var temp = other.attr("text");
        ovBox = this.getBBox();
        input = other.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
        input.addEventListener("blur", function() {
            other.inlineTextEditing.stopEditing(tasta);
            if (other.attr("text") != temp) {
                read_table.sep = other.attr("text");
                Shiny.onInputChange("read_table", read_table);
                radios.moveTo(3);
                if (dirfile.filename != "") {
                    console_command("import");
                    tempdatainfo.nrows = 0;
                    checkIfDataLoadedInR();
                }
            }
            me.toFront();
            
            tasta = "enter";
        }, true);
    });
    
    other_rect.mouseover(function() {
        if (other_clicked) {
            this.attr({'cursor':'pointer'});
        }
    });
    
    other_rect.mouseout(function() {
        this.attr({'cursor':''});
    });
    
    sat(paper.text(stx + 140, sty + 15, "Decimal:"));
    var decimal = paper.radio(stx + 150, sty + 40, 0, ["dot", "comma"]);
    
    decimal.cover[0].click(function() {
        read_table.dec = ".";
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    decimal.cover[1].click(function() {
        read_table.dec = ",";
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    var header = paper.checkBox(stx + 5, sty + 142, read_table.header, "Column names in the file header");
    header.cover.click(function() {
        read_table.header = !header.isChecked;
        Shiny.onInputChange("read_table", read_table);
        if (dirfile.filename != "") {
            console_command("import");
            tempdatainfo.nrows = 0;
            checkIfDataLoadedInR();
        }
    });
    
    var row_names = paper.rect(stx + 5, sty + 173, 70, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
    row_names.text = sat(paper.text(stx + 10, sty + 183, read_table.row_names),
                        {"clip": (stx + 5) + ", " + (sty + 173) + ", 68, 20"});
    
    sat(paper.text(stx + 80, sty + 175, "No./name of column"));
    sat(paper.text(stx + 80, sty + 191, "containing row names"));
    
    paper.inlineTextEditing(row_names.text);
    row_names.click(function(e) {
        var me = this;
        e.stopPropagation();
        
        var temp = row_names.text.attr("text");
        
        ovBox = me.getBBox();
        
        input = row_names.text.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
        input.addEventListener("blur", function(e) {
        
            row_names.text.inlineTextEditing.stopEditing(tasta);
            
            if (row_names.text.attr("text") != temp) {
            
                read_table.row_names = row_names.text.attr("text");
                
                Shiny.onInputChange("read_table", read_table);
                
                if (dirfile.filename != "") {
                    console_command("import");
                    tempdatainfo.nrows = 0;
                    checkIfDataLoadedInR();
                }
            }
            me.toFront();
            tasta = "enter";
        }, true);
    });
    
    sat(paper.text(stx + 5, sty + 218, "Preview column names:"));
    
    sat(paper.text(stx + 251, sty + 15, "Directory:"));
    paper.stdir_text = sat(paper.text(stx + 320, sty + 15, read_table.row_names),
                        {"clip": (stx + 315) + ", " + (sty + 5) + ", 337, 20"});
    
    paper.inlineTextEditing(paper.stdir_text);
    var stdir_rect = paper.rect(stx + 315, sty + 5, 337, 20)
        .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
        .click(function(e) {
            
            e.stopPropagation();
            var temp = paper.stdir_text.attr("text");
        
            var BBox = this.getBBox();
            
            input = paper.stdir_text.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
            
                paper.stdir_text.inlineTextEditing.stopEditing(tasta);
                
                if (paper.stdir_text.attr("text") != temp) {
                    
                    if (paper.stdir_text.attr("text") == "") {
                        paper.glow.hide();
                        dirfile_chosen[2] = "";
                    }
                    else {
                        dirfile_chosen[0] = "dir";
                        dirfile_chosen[1] = "__stdir__";
                        dirfile_chosen[2] = paper.stdir_text.attr("text");
                        pathcopy = dirfile.filepath;
                        Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                        printDirsWhenPathChanges();
                    }
                }
                
                tasta = "enter";
            }, true);
        });
        
    paper.glow = stdir_rect.glow({
        color: "#ff0000",
        width: 4
    });
    paper.glow.hide();
    
    sat(paper.text(stx + 595, sty + 378.5, "Import"));
    
    import_open = paper.rect(stx + 577, sty + 366, 75, 25)
        .attr({"stroke-width": 1.25, fill: "#ffffff", "fill-opacity": 0})
        .click(function(e) {
            e.stopPropagation();
            
            if (dirfile.filename != "" && tempdatainfo.rownames != "error!") {
                dirfilist.refresh = false;
                
                var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
                
                history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                histindex = history.length;
                var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#tempdiv").remove();
                $("#result_main").append("<span style='color:#932192'>> </span><span style='color:blue'>" + header + "</span><br><br>");
                
                createCommandPromptInRconsole();
                
                function littleWait() {
                    updatecounter += 1;
                    
                    if (updatecounter < 101) { 
                        
                        if (datainfo.nrows > 0) {
                            
                            colclicks = new Array();
                            refresh_cols("all");
                            filldirexp();
                            
                            if (poinths.thvals.length > 0) {
                                drawPointsAndThresholds();
                            }
                            
                            if ($("#data_editor").length) {
                                scrollvh = [0, 0, 16, 7];
                                $("#data_body").scrollTop(0);
                                $("#data_body").scrollLeft(0);
                                print_data();
                            }
                            
                            imported_filename = dirfile.filename;
                            
                            $("#import").remove();
                            
                            refresh_dirs();
                            
                            updatecounter = 0; 
                        }
                        else {
                            setTimeout(littleWait, 50);
                        }
                    }
                }
                
                if (importobj != read_table) {
                    importobj = copyObject(read_table);
                }
                
                datainfo.nrows = 0;
                updatecounter = 0;
                Shiny.onInputChange("import", importobj);
                
                littleWait();
                
            }
            else {
                
                var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
                history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                histindex = history.length;
                var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#tempdiv").remove();
                $("#result_main").append("<span style='color:#932192'>> </span><span style='color:blue'>" + header + "</span><br><br>");
                $("#result_main").append("<span style='color:red'>Error: this is not a valid dataset.</span><br><br>");
                
                createCommandPromptInRconsole();
            }
        })
    
    import_open.obj = ["", ""];
    import_open.value = 0;
    
    var fname = paper.checkBox(stx + 5, sty + 373, read_table.filename, "Name the R object");
    fname.cover.click(function() {
        if (this.isChecked) {
            fname.label[0].attr({"text": "Name of the R object:"});
            read_table.filename = fnametext.attr("text");
            fnameset.show();
        }
        else {
            fname.label[0].attr({"text": "Name the R object"});
            read_table.filename = "";
            fnameset.hide();
        }
        console_command("import");
    });
    
    var fnameset = paper.set();
    var fnametext = sat(paper.text(stx + 170, sty + 378, ""),
                    {"clip": (stx + 165) + ", " + (sty + 368) + ", 250, 20"});
    var fname_rect = paper.rect(stx + 165, sty + 368, 250, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
    paper.inlineTextEditing(fnametext);
    
    fname_rect.click(function(e) {
        var me = this;
        e.stopPropagation();
        var temp = fnametext.attr("text");
        ovBox = this.getBBox();
        input = fnametext.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
        input.addEventListener("blur", function() {
            fnametext.inlineTextEditing.stopEditing(tasta);
            if (fnametext.attr("text") != temp) {
                read_table.filename = fnametext.attr("text").replace(/[^A-Za-z0-9]/g, '');
                if (isNumeric(read_table.filename[0])) {
                    read_table.filename = "x" + read_table.filename;
                }
                fnametext.attr({"text": read_table.filename});
                if (dirfile.filename != "") {
                    console_command("import");
                }
            }
            me.toFront();
            
            tasta = "enter";
        }, true);
    });
    
    fnameset.push(fnametext, fname_rect);
    fnameset.hide();
    
    refresh_dirs();
}

function draw_export(paper) {
    
    if ($("#export").length) {
    
        paper.clear();
        var stx = 13;
        var sty = 10;
    
        sat(paper.text(stx + 5, sty + 15, "Separator:"));
        
        var radios = paper.radio(stx + 11, sty + 40, 0, ["comma", "space", "tab", "other, please specify:"]);
        
        radios.cover[0].click(function() {
            exportobj.sep = ",";
            console_command("export");
        });
        
        radios.cover[1].click(function() {
            exportobj.sep = " ";
            console_command("export");
        });
        
        radios.cover[2].click(function() {
            exportobj.sep = "tab";
            console_command("export");
        });
        
        var other = sat(paper.text(stx + 170, sty + 116, ""),
                        {"clip": (stx + 165) + "," + (sty + 106) + ",35,20"});
        var other_rect = paper.rect(stx + 165, sty + 106, 37, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
        paper.inlineTextEditing(other);
        
        var other_clicked = false;
        
        other_rect.click(function(e) {
            e.stopPropagation();
            var me = this;
            ovBox = this.getBBox();
            input = other.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
            input.addEventListener("blur", function(e) {
                other.inlineTextEditing.stopEditing(tasta);
                
                exportobj.sep = other.attr("text");
                radios.moveTo(3);
                
                me.toFront();
                
                tasta = "enter";
            }, true);
        });
        
        other_rect.mouseover(function() {
            if (other_clicked) {
                this.attr({'cursor':'pointer'});
            }
        });
        
        other_rect.mouseout(function() {
            this.attr({'cursor':''});
        });
        
        var header = paper.checkBox(stx + 5, sty + 145, exportobj.header, "Write column names");
        header.cover.click(function() {
            exportobj.header = header.isChecked;
            console_command("export");
        });
        
        var caseidset = paper.set();
        
        caseidset.push(sat(paper.text(stx + 25, sty + 180, "case id:")));
        var caseid = sat(paper.text(stx + 110, sty + 180, exportobj.caseid),
                         {"clip": (stx + 110) + ", " + (sty + 170) + ", 98, 20"});
        var caseid_rect = paper.rect(stx + 105, sty + 170, 100, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
        paper.inlineTextEditing(caseid);
        
        caseid_rect.click(function(e) {
            e.stopPropagation();
            var me = this;
            ovBox = this.getBBox();
            input = caseid.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
            input.addEventListener("blur", function(e) {
                caseid.inlineTextEditing.stopEditing(tasta);
                exportobj.caseid = caseid.attr("text");
                console_command("export");
                
                me.toFront();
                
                tasta = "enter";
            }, true);
        });
        
        caseidset.push(caseid, caseid_rect);
        
        sat(paper.text(stx + 5, sty + 317, "New file:"));
        
        if (exportobj.filename == "") {
            exportobj.filename = ((read_table.filename != "")?read_table.filename:imported_filename) + ((dirfile.extension == "")?"":".") + dirfile.extension;
        }
        
        paper.newname = sat(paper.text(stx + 74, sty + 318, exportobj.filename),
                            {"clip": (stx + 69) + ", " + (sty + 308) + ", 448, 20"});
        var newname_rect = paper.rect(stx + 69, sty + 308, 450, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
        paper.inlineTextEditing(paper.newname);
        
        newname_rect.click(function(e) {
            e.stopPropagation();
            var me = this;
            ovBox = this.getBBox();
            input = paper.newname.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
            input.addEventListener("blur", function(e) {
                paper.newname.inlineTextEditing.stopEditing(tasta);
                
                exportobj.filename = paper.newname.attr("text");
                
                if (dirfile.files.indexOf(exportobj.filename) >= 0) {
                    paper.ovr.showIt();
                }
                else {
                    paper.ovr.hideIt();
                }
                
                console_command("export");
                
                me.toFront();
                
                tasta = "enter";
            }, true);
        });
        
        paper.ovr = paper.checkBox(stx + 70, sty + 287, 1, "Overwrite?");
        paper.ovr.hideIt();
        
        if (dirfile.files.indexOf(exportobj.filename) >= 0) {
            paper.ovr.showIt();
        }
        
        paper.ovr.cover.click(function() {
            paper.newname.attr({"text": ""});
            exportobj.filename = "";
            paper.ovr.check();
            paper.ovr.hideIt();
            console_command("export");
        });
        
        sat(paper.text(stx + 257, sty + 15, "Set working directory:"));
        
        sat(paper.text(stx + 570, sty + 318.5, "Export"));
        
        var export_rect = paper.rect(stx + 552, sty + 306, 75, 25)
            .attr({"stroke-width": 1.25, fill: "#ffffff", "fill-opacity": 0})
            .click(function(e) {
                e.stopPropagation();
                
                console_command("export");
                
                var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
                history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                histindex = history.length;
                var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#tempdiv").remove();
                $("#result_main").append("<span style='color:#932192'>> </span><span style='color:blue'>" + header + "</span><br><br>");
                
                createCommandPromptInRconsole();
                
                exportobj.counter += 1;
                Shiny.onInputChange("exportobj", exportobj);
                
                $("#export").remove();
            })
        
        refresh_dirs();
        
    }

}

function draw_saveRplot(paper) {
    
    if ($("#saveRplot").length) {
    
        paper.clear();
        var stx = 13;
        var sty = 10;
        
        if (plotopen) {
            $("#preview").css({
                "background-image": "url('css/images/plot.svg?" + new Date().getTime() + "')", 
                "background-size": "100% 100%"
            });
        }
        
        var noplot = sat(paper.text(stx + 55, sty + 105, "No R plot window"));
        
        sat(paper.text(stx + 10, sty + 230, "Type:"));
        var radios = paper.radio(stx + 60, sty + 230, 0,
                                 ["PNG", "BMP", "JPEG", "TIFF", "SVG", "PDF"],
                                 vertspace = [0, 25, 50, 0, 25, 50], horspace = [0, 0, 0, 75, 75, 75]);
        
        radios.cover[0].click(function() {
            saveRplot.type = "png";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        radios.cover[1].click(function() {
            saveRplot.type = "bmp";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        radios.cover[2].click(function() {
            saveRplot.type = "jpeg";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        radios.cover[3].click(function() {
            saveRplot.type = "tiff";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        radios.cover[4].click(function() {
            saveRplot.type = "svg";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        radios.cover[5].click(function() {
            saveRplot.type = "pdf";
            if (saveRplot.filename !== "") {
                paper.filename.attr({"text": saveRplot.filename + "." + saveRplot.type})
            }
            
            if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                paper.ovr.showIt();
            }
            else {
                paper.ovr.hideIt();
            }
        });
        
        sat(paper.text(stx, sty + 342, "File name:"));
        
        paper.filename = sat(paper.text(stx + 74, sty + 343, saveRplot.filename),
                            {"clip": (stx + 69) + ", " + (sty + 333) + ", 448, 20"});
        var filename_rect = paper.rect(stx + 69, sty + 333, 450, 20, 3).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"});
        paper.inlineTextEditing(paper.filename);
        
        filename_rect.click(function(e) {
            e.stopPropagation();
            var me = this;
            ovBox = this.getBBox();
            input = paper.filename.inlineTextEditing.startEditing(ovBox.x + 1, ovBox.y + 21 - 1*(navigator.browserType == "Firefox"), ovBox.width - 2, ovBox.height - 2);
            input.addEventListener("blur", function(e) {
                paper.filename.inlineTextEditing.stopEditing(tasta);
                
                var checkext = paper.filename.attr("text").split(".");
                var filename = (checkext.length > 1)?(copyArray(checkext).splice(0, checkext.length - 1).join(".")):(checkext[0]);
                var extension = (checkext.length > 1)?(checkext[checkext.length - 1]):("");
                
                if (extension !== saveRplot.type) {
                    saveRplot.filename = paper.filename.attr("text");
                    paper.filename.attr({"text": paper.filename.attr("text") + "." + saveRplot.type});
                }
                else {
                    saveRplot.filename = filename;
                }
                
                if (dirfile.files.indexOf(saveRplot.filename + "." + saveRplot.type) >= 0) {
                    paper.ovr.showIt();
                }
                else {
                    paper.ovr.hideIt();
                }
                
                me.toFront();
                
                tasta = "enter";
            }, true);
        });
        
        paper.ovr = paper.checkBox(stx + 70, sty + 312, 1, "Overwrite?");
        paper.ovr.hideIt();
        
        if (dirfile.files.indexOf(saveRplot.filename) >= 0) {
            paper.ovr.showIt();
        }
        
        paper.ovr.cover.click(function() {
            paper.filename.attr({"text": ""});
            saveRplot.filename = "";
            paper.ovr.check();
            paper.ovr.hideIt();
            
        });
        
        sat(paper.text(stx + 257, sty + 15, "Set working directory:"));
        
        sat(paper.text(stx + 574, sty + 343.5, "Save"));
        
        var saveRplot_rect = paper.rect(stx + 552, sty + 331, 75, 25)
            .attr({"stroke-width": 1.25, fill: "#ffffff", "fill-opacity": 0})
            .click(function(e) {
                e.stopPropagation();
                
                if (saveRplot.filename !== "" && plotopen) {
                    saveRplot.counter += 1;
                    Shiny.onInputChange("saveRplot", saveRplot);
                    
                    $("#saveRplot").remove();
                    
                } 
            })
        
        refresh_dirs();
        
    }

}

function refresh_cols(include, exclude) {
    
    var allwindows = ["import", "eqmcc", "tt", "calibrate", "recode", "xyplot"];
    
    if (include == "all") {
        include = copyArray(allwindows);
    }
    else if (include == "exclude") {
        
        include = copyArray(allwindows, allwindows.indexOf(exclude));
    }
    else {
        include = [include];
    }
    
    for (var i = 0; i < include.length; i++) {
        
        if (include[i] == "import") {
            if ($("#import").length) {
                print_cols(papers["importcols"],
                           {
                                "dialog": "import",
                                "identifier": "importcols",
                                "selection": "none",
                                "cols": tempdatainfo.colnames,
                                "selectable": ["all"] 
                           });
            }
        }
        
        if (include[i] == "eqmcc") {
            if ($("#eqmcc").length) {
                print_cols(papers["eqcols1"],
                           {
                                "dialog": "eqmcc",
                                "identifier": "outcome",
                                "selection": "multiple",
                                "cols": datainfo.colnames,
                                "selectable": ["all"]
                           });
                print_cols(papers["eqcols2"],
                           {
                                "dialog": "eqmcc",
                                "identifier": "conditions",
                                "selection": "multiple",
                                "cols": datainfo.colnames,
                                "selectable": ["all"]
                           });
            }
        }
        
        if (include[i] == "tt") {
            if ($("#tt").length) {
                print_cols(papers["ttcols1"],
                           {
                                "dialog": "tt",
                                "identifier": "outcome",
                                "selection": "single",
                                "cols": datainfo.colnames,
                                "selectable": ["all"]
                           });
                print_cols(papers["ttcols2"],
                           {
                                "dialog": "tt",
                                "identifier": "conditions",
                                "selection": "multiple",
                                "cols": datainfo.colnames,
                                "selectable": ["all"]
                           });
            }
        }
        
        if (include[i] == "calibrate") {
            if ($("#calibrate").length) {
                print_cols(papers["calibcols"],
                           {
                                "dialog": "calibrate",
                                "identifier": "x",
                                "selection": "single",
                                "cols": datainfo.colnames,
                                "selectable": ["numerics"],
                                "numerics": datainfo.numerics
                           });
            }
        }
        
        if (include[i] == "recode") {
            if ($("#recode").length) {
                print_cols(papers["recodecols"],
                           {
                                "dialog": "recode",
                                "identifier": "x",
                                "selection": "single",
                                "cols": datainfo.colnames,
                                "selectable": ["all"]
                           });
                print_cols(papers["recrules"],
                           {
                                "dialog": "recode",
                                "identifier": "rules",
                                "selection": "multiple",
                                "cols": makeRules(recode.oldv, recode.newv),
                                "selectable": ["all"]
                           });
            }
        }
        
        if (include[i] == "xyplot") {
            if ($("#xyplot").length) {
                print_cols(papers["xyplotcols1"],
                           {
                                "dialog": "xyplot",
                                "identifier": "y",
                                "selection": "single",
                                "cols": datainfo.colnames,
                                "selectable": ["numerics", "calibrated"],
                                "numerics": datainfo.numerics,
                                "calibrated": datainfo.calibrated
                           });
                print_cols(papers["xyplotcols2"],
                           {
                                "dialog": "xyplot",
                                "identifier": "x",
                                "selection": "single",
                                "cols": datainfo.colnames,
                                "selectable": ["numerics", "calibrated"],
                                "numerics": datainfo.numerics,
                                "calibrated": datainfo.calibrated
                           });
            }
        }
    }
}

function draw_calib(paper) {
if ($("#calibrate").length) {
    
    paper.clear();
    
    paper.crfuz = 0;
    
    var thlabelsfuz = ["exclusion", "crossover", "inclusion"];
    var thlabelscrp = ["th1", "th2", "th3"]
    var thlabels = new Array(6);
    var thcovers = new Array(6);
    var increasing = false;
    
    paper.thsetter_frame = paper.rect(152, 168.5, 320, 90).attr({stroke: "#d0d0d0"});
                                         
    sat(paper.text(18, 24, "Choose condition:"));
    
    var stx = 153, sty = 27;
    
    var crfuz = paper.radio(stx + 15, sty, 1*(calibrate.type == "fuzzy"), ["crisp", "fuzzy"]);
    
    crfuz.cover[0].click(function() {
        paper.crfuz = 0;
        changeLabels();
        
        calibrate.thresholds = new Array(thinfo.nth);
        calibrate.thnames = new Array(thinfo.nth);
        
        calibrate.thscopyfuz = new Array(6);
        for (var i = 0; i < 6; i++) {
            calibrate.thscopyfuz[i] = ths[i].attr("text");
            if (i > 0) {
                thsets[i].hide();
            }
            
        }
        
        for (var i = 0; i < 3; i++) {
            ths[i].attr({"text": calibrate.thscopycrp[i]});
            if (i < thinfo.nth) {
                calibrate.thresholds[i] = calibrate.thscopycrp[i];
                calibrate.thnames[i] = "t" + i;
            }
        }
        
        showCrisp();
        
        calibrate.type = "crisp";
        console_command("calibrate");
        drawPointsAndThresholds();
        
    });
    
    crfuz.cover[1].click(function() {
        paper.crfuz = 1;
        changeLabels();
        
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        
        for (var i = 0; i < 3; i++) {
            calibrate.thscopycrp[i] = ths[i].attr("text");
        }
        
        for (var i = 0; i < 6; i++) {
            ths[i].attr({"text": calibrate.thscopyfuz[i]});
        }
        
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        
        for (var i = 0; i < ((endmid.whichChecked == 0)?3:6); i++) {
            calibrate.thresholds[i] = calibrate.thscopyfuz[i];
            calibrate.thnames[i] = thlabels.sub(i) + ((endmid.whichChecked == 0)?"":((i < 3)?1:2));
        }
        
        showFuzzy();
        
        calibrate.type = "fuzzy";
        console_command("calibrate");
        
    });
    
    var thinfoset = paper.set();
    
    var thinfotext = sat(paper.text(stx + 145, sty - 5, "Number of thresholds: 1"));
    thinfoset.push(thinfotext);
    
    thinfoset.push(paper.rect(stx + 308.5, sty - 13, 1, 6));
    thinfoset.push(paper.rect(stx + 306, sty - 10.5, 6, 1));
    thinfoset.push(paper.rect(stx + 306, sty +  3.5, 6, 1));
    
    var plus = sat(paper.rect(stx + 303, sty - 16, 12, 12));
    var minus = sat(paper.rect(stx + 303, sty - 2, 12, 12));
    thinfoset.push(plus, minus);
    
    plus.click(function() {
        thinfo.nth += 1;
        if (thinfo.nth > 3) {
            thinfo.nth = 3;
        }
        
        calibrate.thresholds = new Array(thinfo.nth);
        calibrate.thnames = new Array(thinfo.nth);
        for (var i = 0; i < thinfo.nth; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i);
        }
        
        showths();
        console_command("calibrate");
        
        if (findth.isChecked) {
            poinths.message = "noresponse";
            updatecounter = 0;
            Shiny.onInputChange("thinfo", thinfo);
            doWhenDataPointsAreReturned();
        }
        else {
            drawPointsAndThresholds();
        }
    });
    
    minus.click(function() {
        thinfo.nth -= 1;
        if (thinfo.nth < 1) {
            thinfo.nth = 1;
        }
        
        calibrate.thresholds = new Array(thinfo.nth);
        calibrate.thnames = new Array(thinfo.nth);
        for (var i = 0; i < thinfo.nth; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i);
        }
        
        showths();
        console_command("calibrate");
        
        if (findth.isChecked) {
            poinths.message = "noresponse";
            updatecounter = 0;
            Shiny.onInputChange("thinfo", thinfo);
            doWhenDataPointsAreReturned();
        }
        else {
            drawPointsAndThresholds();
        }
    });
    
    function showths() {
        thinfotext.attr({"text": ("Number of thresholds: " + thinfo.nth)});
        for (var i = 1; i < 3; i++) {
            if (i < thinfo.nth) {
                thsets[i].show();
            }
            else {
                
                thsets[i].hide();
            }
        }
        
        for (i = 3; i < 6; i++) {
            thsets[i].hide();
        }
    }
    
    var inclth = paper.checkBox(stx + 9, sty + 55, calibrate.include, "including thresholds");
    inclth.cover.click(function() {
            calibrate.include = inclth.isChecked;
            console_command("calibrate");
        });
    
    var findth = paper.checkBox(stx + 9, sty + 80, calibrate.findth, "find thresholds");
    findth.cover.click(function() {
        calibrate.findth = findth.isChecked;
        
        thinfo.th = findth.isChecked;
        
        if (getKeys(colclicks).indexOf("calibrate") >= 0) {
            
            calibrate.x[0] = getTrueKeys(colclicks.calibrate.x);
            
            if (calibrate.findth && calibrate.x[0].length > 0) {
                thinfo.counter = 1 - thinfo.counter; 
                updatecounter = 0;
                poinths.message = "noresponse";
                
                Shiny.onInputChange("thinfo", thinfo);
                doWhenDataPointsAreReturned();
            }
        }
    });
    
    var jitter = paper.checkBox(stx + 9, sty + 105, calibrate.findth, "jitter points");
    jitter.cover.click(function() {
        calibrate.jitter = jitter.isChecked;
        
        if (!calibrate.jitter) {
            thsetter_jitter = new Array();
        }
        
        if (calibrate.x[0].length > 0) {
            drawPointsAndThresholds();
        }
    });
    
    var logistic = paper.checkBox(stx + 9, sty + 55, calibrate.logistic, "logistic");
    logistic.cover.click(function() {
        calibrate.logistic = logistic.isChecked;
        if (logistic.isChecked) {
            endmid.moveTo(0);
            idm.show();
            ecdf.uncheck();
            calibrate.ecdf = false;
            
            changeLabels();
        
            thsets[3].hide();
            thsets[4].hide();
            thsets[5].hide();
            incdecshape6.hide();
            incdecshape3.show();
            
            changeLabels();
            calibrate.thresholds = new Array();
            calibrate.thnames = new Array();
            for (var i = 0; i < 3; i++) {
                calibrate.thresholds[i] = ths[i].attr("text");
                calibrate.thnames[i] = thlabels.sub(i);
            }
            
        }
        else {
            idm.hide();
        }
        
        console_command("calibrate")
    });
    
    var ecdf = paper.checkBox(stx + 9, sty + 80, calibrate.ecdf, "ecdf");
    ecdf.cover.click(function() {
        calibrate.ecdf = ecdf.isChecked;
        
        if (calibrate.ecdf) {
            endmid.moveTo(0);
            thsets[3].hide();
            thsets[4].hide();
            thsets[5].hide();
            incdecshape6.hide();
            incdecshape3.show();
            logistic.uncheck();
            calibrate.logistic = false;
            idm.hide();
            
            changeLabels();
            calibrate.thresholds = new Array();
            calibrate.thnames = new Array();
            for (var i = 0; i < 3; i++) {
                calibrate.thresholds[i] = ths[i].attr("text");
                calibrate.thnames[i] = thlabels.sub(i);
            }
        }
        
        console_command("calibrate");
        
    });
    
    var idm = paper.set();
    
    idm.push(sat(paper.text(stx + 92, sty + 38, "idm")));
    var idmtext = sat(paper.text(stx + 85, sty + 60, calibrate.idm));
    
    idm.push(idmtext);
    idm.push(sat(paper.rect(stx + 80, sty + 50, 50, 20, 3))
        .click(function(e) {
            
            e.stopPropagation();
            var me = this;
            var BBox = this.getBBox();
            input = idmtext.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                idmtext.inlineTextEditing.stopEditing(tasta);
                calibrate.idm = idmtext.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(idmtext);
    
    var incdec = paper.radio(stx + 15, sty + 130, 1 - calibrate.increasing, ["increasing", "decreasing"]);
    
    incdec.cover[0].click(function() {
        
        calibrate.increasing = true;
        
        changeLabels();
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        for (var i = 0; i < ((endmid.whichChecked == 0)?3:6); i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i) + ((endmid.whichChecked == 0)?"":((i < 3)?1:2));
        }
        
        console_command("calibrate");
    });
    
    incdec.cover[1].click(function() {
        
        calibrate.increasing = false;
            
        changeLabels();
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        for (var i = 0; i < ((endmid.whichChecked == 0)?3:6); i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i) + ((endmid.whichChecked == 0)?"":((i < 3)?1:2))
        }
        
        console_command("calibrate");
    });
    
    var endmid = paper.radio(stx + 15, sty + 195, 1 - calibrate.end, ["s-shaped", "bell-shaped"]);
    
    endmid.cover[0].click(function() {
        copyThs.show();
        copytext2.hide();
        calibrate.end = true;
        
        logistic.showIt();
        if (logistic.isChecked) {
            idm.show()
        }
        ecdf.showIt();
        
        thsets[3].hide();
        thsets[4].hide();
        thsets[5].hide();
        incdecshape6.hide();
        incdecshape3.show();
        
        changeLabels();
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        for (var i = 0; i < 3; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i);
        }
        
        console_command("calibrate");
    });
    
    endmid.cover[1].click(function() {
        copyThs.hide();
        calibrate.end = false;
        
        logistic.hideIt();
        
        idm.hide();
        ecdf.hideIt();
        
        thsets[3].show();
        thsets[4].show();
        thsets[5].show();
        incdecshape6.show();
        incdecshape3.hide();
        
        changeLabels();
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        for (var i = 0; i < 6; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i) + ((i < 3)?1:2);
        }
        
        console_command("calibrate");
    });
    
    var mx =  stx + 60;
    var my =  sty + 135;
    var incdecshape3 = paper.set();
    var incdecshape6 = paper.set();
    
    incdecshape6.push(paper.path([
        ["M", mx, my],
        ["L", mx + 5, my],
        ["L", mx + 10, my - 10],
        ["L", mx + 15, my - 10],
        ["L", mx + 20, my],
        ["L", mx + 25, my]
    ]));
    
    mx += 5;
    my += 25; 
    incdecshape6.push(paper.path([
        ["M", mx, my - 10],
        ["L", mx + 5, my - 10],
        ["L", mx + 10, my],
        ["L", mx + 15, my],
        ["L", mx + 20, my - 10],
        ["L", mx + 25, my - 10]
    ]));
    
    mx += 35;
    my -= 23;
    incdecshape3.push(paper.path([
        ["M", mx, my],
        ["L", mx + 5, my],
        ["L", mx + 15, my - 10],
        ["L", mx + 20, my - 10]
    ]));
    
    mx += 5;
    my += 23;
    incdecshape3.push(paper.path([
        ["M", mx, my - 10],
        ["L", mx + 5, my - 10],
        ["L", mx + 15, my],
        ["L", mx + 20, my]
    ]));
    
    function changeLabels() {
        
        if (crfuz.whichChecked == 0) { 
            for (var i = 0; i < 3; i++) {
                thlabels[i].attr({"text": thlabelscrp[i]});
            }
            
        }
        else { 
            incdec.label[0].attr({"text": (endmid.whichChecked == 0)?"increasing":"incr \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 decr"});
            incdec.label[1].attr({"text": (endmid.whichChecked == 0)?"decreasing":"decr \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 incr"});
            
            for (var i = 0; i < 6; i++) {
                if (incdec.whichChecked == 0) { 
                    thlabels[i].attr({"text": thlabelsfuz[(i < 3)?(i):(5 - i)] + ((endmid.whichChecked == 0)?"":((i < 3)?1:2))});
                }
                else { 
                    thlabels[i].attr({"text": thlabelsfuz[(i < 3)?(2 - i):(i - 3)] + ((endmid.whichChecked == 0)?"":((i < 3)?1:2))});
                }
            }
        }
    }
    
    var thsets = new Array(6);
    for (var i = 0; i < 6; i++) {
        thsets[i] = paper.set();
    }
    
    stx = 410;
    sty = 45;
    
    var thtitle = sat(paper.text(stx - 13, sty - 15, "Thresholds:"));
    
    for (var i = 0; i < 6; i++) {
        
        ths[i] = sat(paper.text(stx + 15, sty + 10 + i*25, (calibrate.type == "crisp")?calibrate.thscopycrp[i]:calibrate.thscopyfuz[i]),
                     {"clip": (stx + 10) + "," + (sty + i*25) + ", 47, 20"});
        thlabels[i] = sat(paper.text(stx, sty + 10 + i*25, thlabelscrp[i%3]), {"anchor": "end"});
        thcovers[i] = sat(paper.rect(stx + 10, sty + i*25, 50, 20, 3));
        thcovers[i].i = i;
        thcovers[i].click(function(e) {
            
            var me = this;
            e.stopPropagation();
            
            var temp = ths[this.i].attr("text");
            var tobe = sat(paper.text(0, 0, temp));
            paper.inlineTextEditing(tobe);
            
            var BBox = this.getBBox();
            input = tobe.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.i = this.i;
            input.addEventListener("blur", function(e) {
                tobe.inlineTextEditing.stopEditing(tasta);
                if (temp != tobe.attr("text")) {
                    findth.uncheck();
                    calibrate.findth = false;
                    
                    var finaltext = tobe.attr("text");
                    if ($.isNumeric(finaltext)) { 
                        finaltext = 1*finaltext;
                        
                        if (poinths.thvals.length > 0) {
                            if (finaltext < min(poinths.vals)) {
                                finaltext = "" + min(poinths.vals);
                            }
                            
                            if (finaltext > max(poinths.vals)) {
                                finaltext = "" + max(poinths.vals);
                            }
                        }
                    }
                    else {
                        finaltext = "";
                    }
                    
                    ths[this.i].attr({"text": finaltext});
                    
                    calibrate.thresholds[this.i] = finaltext;
                    
                    if (crfuz.whichChecked == 0) { 
                        calibrate.thscopycrp[this.i] = finaltext;
                        drawPointsAndThresholds();
                    }
                    else { 
                        calibrate.thscopyfuz[this.i] = finaltext;
                    }
                    
                    if (endmid.whichChecked == 1) {
                        calibrate.thnames[this.i] = thlabels.sub(this.i) + ((this.i < 3)?1:2);
                    }
                    else {
                        calibrate.thnames[this.i] = thlabels.sub(this.i);
                    }
                    
                    console_command("calibrate");
                }
                
                me.toFront();
                
                tasta = "enter";
                tobe.remove();
            });
        });
        
        thsets[i].push(ths[i], thlabels[i], thcovers[i]);
    }
    
    thlabels[0].attr({"text": thlabelscrp[0]});
    
    thlabels.sub = function(x) {
        return(thlabels[x].attr("text").substring(0, 1))
    }
    
    var abset = paper.set();
    abset.push(sat(paper.text(stx + 60, sty + 160, "Shape form:"), {"anchor": "end"}));
    abset.push(sat(paper.text(stx, sty + 185, "above crossover"), {"anchor": "end"}));
    abset.push(sat(paper.text(stx, sty + 210, "below crossover"), {"anchor": "end"}));
    
    var avalue = sat(paper.text(stx + 14.5, sty + 185, "1"), {"anchor": "start"});
    var bvalue = sat(paper.text(stx + 14.5, sty + 210, "1"), {"anchor": "start"});
    abset.push(bvalue, avalue);
    
    abset.push(sat(paper.rect(stx + 10, sty + 175, 50, 20, 3))
        .click(function(e) {
            e.stopPropagation();
            var me = this;
            var BBox = this.getBBox();
            input = avalue.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                avalue.inlineTextEditing.stopEditing(tasta);
                calibrate.above = avalue.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(bvalue);
    
    abset.push(sat(paper.rect(stx + 10, sty + 200, 50, 20, 3))
        .click(function(e) {
            var me = this;
            e.stopPropagation();
            var BBox = this.getBBox();
            input = bvalue.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                bvalue.inlineTextEditing.stopEditing(tasta);
                calibrate.below = bvalue.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(avalue);
    
    copyThs = paper.set();
    copytext1 = sat(paper.text(stx - 46, sty + 90, "Copy from crisp"));
    copytext2 = sat(paper.text(stx - 47, sty + 90, "Copy from fuzzy"));
    cFCrect = paper.rect(stx - 54, sty + 100 - 23, 115, 25).attr({fill: "white", "fill-opacity": 0, 'stroke-width': 0.75})
         .click(function() {
             
             for (var i = 0; i < 3; i++) {
                 if (crfuz.whichChecked == 0) {
                     
                     calibrate.thscopycrp[i] = calibrate.thscopyfuz[i];
                     ths[i].attr({"text": calibrate.thscopyfuz[i]});
                     
                     if (i < thinfo.nth) {
                         calibrate.thresholds[i] = calibrate.thscopyfuz[i];
                     }
                 }
                 else {
                     
                     calibrate.thscopyfuz[i] = calibrate.thscopycrp[i];
                     ths[i].attr({"text": calibrate.thscopycrp[i]});
                     calibrate.thresholds[i] = calibrate.thscopycrp[i];
                 }
             }
             
             if (crfuz.whichChecked == 0) {
                 drawPointsAndThresholds();
             }
             console_command("calibrate");
             
         });
    copyThs.push(copytext1, copytext2, cFCrect);
    
    function showCrisp() {
        thinfoset.show();
        paper.thsetter_frame.show();
        thsetter_content.show();
        inclth.showIt();
        findth.showIt();
        logistic.hideIt();
        ecdf.hideIt();
        incdec.hideIt();
        endmid.hideIt();
        idm.hide();
        thtitle.hide();
        
        abset.hide();
        incdecshape3.hide();
        incdecshape6.hide();
        
        copyThs.show();
        copytext1.hide();
        copytext2.show();
        jitter.showIt();
        
        showths();
        
        changeLabels();
        
    }
    
    function showFuzzy() {
        paper.thsetter_frame.hide();
        thsetter_content.hide();
        inclth.hideIt();
        
        if (endmid.whichChecked == 1) {
            logistic.hideIt();
            idm.hide();
            ecdf.hideIt();
        }
        else {
            logistic.showIt();
            ecdf.showIt();
            if (logistic.isChecked) {
                idm.show();
            }
            else {
                idm.hide();
            }
        }
        
        incdec.showIt();
        endmid.showIt();
        findth.hideIt();
        thinfoset.hide();
        
        jitter.hideIt();
        
        thtitle.show();
        
        thsets[1].show();
        thsets[2].show();
        
        if (endmid.whichChecked == 1) {
            thsets[3].show();
            thsets[4].show();
            thsets[5].show();
            incdecshape6.show();
            incdecshape3.hide();
            copyThs.hide();
        }
        else {
            thsets[3].hide();
            thsets[4].hide();
            thsets[5].hide();
            incdecshape6.hide();
            incdecshape3.show();
            copyThs.show();
            copytext1.show();
            copytext2.hide();
        }
        
        abset.show();
    }
    
    if (calibrate.type == "crisp") {
        showCrisp();
        
        if (calibrate.thsetter) {
            thsetter_content.show();
        }
        else {
            thsetter_content.hide();
        }
    }
    else {
        showFuzzy();
    }
    
    changeLabels();
    
    stx = 13, sty = 260;
    
    var newcond = paper.checkBox(stx + 3, sty + 20, !calibrate.same, "into new condition");
    
    newcond.label[0].remove();
    newcond.label = new Array(2);
    newcond.label[0] = sat(paper.text(stx + 27, sty + 18, "calibrate into"));
    newcond.label[1] = sat(paper.text(stx + 27, sty + 33, "new condition"));
    
    newcond.cover.click(function() {
        calibrate.same = !newcond.isChecked;
        
        if (newcond.isChecked) {
            newname.show();
        }
        else {
            newname.hide();
        }
        
        console_command("calibrate");
    });
    
    var newname = paper.set();
    
    newname.push(sat(paper.text(stx + 139, sty + 25, "new name:")));
    var newnametext = sat(paper.text(stx + 220, sty + 25, calibrate.newvar),
                          {"clip": (stx + 215) + "," + (sty + 16) + ", 79, 20"});
    
    newname.push(newnametext);
    
    newname.push(sat(paper.rect(stx + 215, sty + 15, 80, 20, 3))
        .click(function(e) {
            var me = this;
            e.stopPropagation();
            
            var BBox = this.getBBox();
            input = newnametext.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                newnametext.inlineTextEditing.stopEditing(tasta);
                calibrate.newvar = newnametext.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(newnametext);
    
    if (calibrate.same) {
        newname.hide();
    }
    
    paper.Run = paper.set();
    paper.Run.push(sat(paper.text(423, sty + 30, "Run")));
    paper.Run.push(paper.rect(421 - 20, sty + 17, 70, 25)
    .attr({fill: "white", "fill-opacity": 0, 'stroke-width': 1.25})
    .click(function() {
        
        if (datainfo.rownames != "") {
            var fuzcheck = true;
            
            if (calibrate.type == "fuzzy") {
                if (calibrate.logistic) {
                    
                    if (calibrate.idm == "") {
                        fuzcheck = false;
                    }
                    else {
                        
                        fuzcheck = fuzcheck && !isNaN(calibrate.idm);
                    }
                }
                
                if (calibrate.below == "" || calibrate.above == "") {
                    fuzcheck = false;
                }
                else {
                    
                    fuzcheck = fuzcheck && !isNaN(calibrate.below) && !isNaN(calibrate.above)
                }
            }
            
            calibrate.x[0] = getTrueKeys(colclicks.calibrate.x)[0];
            
            if (calibrate.x[0] != "" && fuzcheck) {
                
                calibrate.counter += 1;
                
                outres[0] = "listen2R";
                calibrate.scrollvh = scrollvh;
                
                Shiny.onInputChange("calibrate", calibrate);
                
                updatecounter = 0;
                doWhenRresponds();
            }
        }
    }));
    
} 
} 

function draw_recode(paper) {
if ($("#recode").length) {
    
    paper.clear();
    paper.rules = new Array();
    paper.rules["oldv"] = "";
    paper.rules["newv"] = "";
    
    var stx = 13, sty = 10;
    
    sat(paper.text(stx + 5, sty + 14, "Choose condition:"), {"text": 0});
    
    paper.newcond = paper.checkBox(stx + 3, sty + 250, !recode.same, "into new condition");
    
    paper.newcond.label[0].remove();
    paper.newcond.label = new Array(2);
    paper.newcond.label[0] = sat(paper.text(stx + 27, sty + 248, "recode into"), {"text": 0});
    paper.newcond.label[1] = sat(paper.text(stx + 27, sty + 263, "new condition"), {"text": 0});
    
    paper.newcond.cover.click(function() {
        recode.same = !paper.newcond.isChecked;
        
        if (paper.newcond.isChecked) {
            paper.newname.show();
        }
        else {
            paper.newname.hide();
        }
        
        console_command("recode");
        
    });
    
    paper.newname = paper.set();
    
    paper.newname.push(sat(paper.text(stx + 139, sty + 255, "new name:")));
    paper.newnametext = sat(paper.text(stx + 220, sty + 255, recode.newvar),
                           {"clip": (stx + 215) + "," + (sty + 246) + ", 79, 20"});
    
    paper.newname.push(paper.newnametext);
    
    paper.newname.push(paper.rect(stx + 215, sty + 245, 80, 20, 3)
        .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
        .click(function(e) {
            e.stopPropagation();
            var me = this;
            var BBox = this.getBBox();
            input = paper.newnametext.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                paper.newnametext.inlineTextEditing.stopEditing(tasta);
                recode.newvar = paper.newnametext.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("recode");
            });
        }));
    paper.inlineTextEditing(paper.newnametext);
    
    if (recode.same) {
        paper.newname.hide();
    }
    
    var stx = 163, sty = 24, vertspace = 34.5;
    
    paper.oldv = new Array();
    paper.newv = new Array();
    paper.oldv.texts = new Array()
    paper.oldv.covers = new Array();
    paper.newv.texts = new Array()
    paper.newv.covers = new Array();
    
    paper.text(stx - 6, sty, "Old value(s):").attr({"text-anchor": "start", "font-size": "14px"});
    paper.text(stx + 175, sty, "New value:").attr({"text-anchor": "start", "font-size": "14px"});
    
    paper.oldradio = paper.radio(stx, sty + vertspace, -1, [
            "value",
            "\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 to",
            "lowest to",
            "\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 to highest",
            "missing",
            "all other values"
            ], vertspace);
    
    paper.oldradio.cover[0].click(function() {
        paper.rules.oldv = paper.oldv.texts.VALUE.attr("text");
    });
    
    paper.oldradio.cover[1].click(function() {
        paper.rules.oldv[0] = paper.oldv.texts.range.FROM.attr("text");
        paper.rules.oldv[1] = paper.oldv.texts.range.TO.attr("text");
    });
    
    paper.oldradio.cover[2].click(function() {
        paper.rules.oldv = paper.oldv.texts.LOWESTTO.attr("text");
    });
    
    paper.oldradio.cover[3].click(function() {
        paper.rules.oldv = paper.oldv.texts.TOHIGHEST.attr("text");
    });
    
    paper.oldradio.cover[4].click(function() {
        paper.rules.oldv = "missing";
    });
    
    paper.oldradio.cover[5].click(function() {
        paper.rules.oldv = "else";
    });
    
    paper.oldv.texts.VALUE  = paper.text(stx + 60, sty + vertspace, "");
    paper.oldv.covers.VALUE = paper.rect(stx + 55, sty + vertspace - 10, 40, 20, 3)
    .click(function(e) {
        e.stopPropagation();
        var me = this;
        paper.oldradio.moveTo(0);
        var BBox = this.getBBox();
        input = paper.oldv.texts.VALUE.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.oldv.texts.VALUE.inlineTextEditing.stopEditing(tasta);
            paper.rules.oldv = paper.oldv.texts.VALUE.attr("text");
            me.toFront();
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.oldv.texts.VALUE);
    
    paper.oldv.texts.range = new Array();
    paper.oldv.covers.range = new Array();
    
    paper.oldv.texts.range.FROM  = paper.text(stx + 19, sty + 2*vertspace, "");
    paper.oldv.covers.range.FROM = paper.rect(stx + 14, sty + 2*vertspace - 10, 40, 20, 3)
    .click(function(e) {
        e.stopPropagation();
        paper.oldradio.moveTo(1);
        paper.rules.oldv = new Array(2);
        paper.rules.oldv[0] = paper.oldv.texts.range.FROM.attr("text");
        paper.rules.oldv[1] = paper.oldv.texts.range.TO.attr("text");
        var BBox = this.getBBox();
        input = paper.oldv.texts.range.FROM.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.oldv.texts.range.FROM.inlineTextEditing.stopEditing(tasta);
            paper.rules.oldv[0] = paper.oldv.texts.range.FROM.attr("text");
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.oldv.texts.range.FROM);
    
    paper.oldv.texts.range.TO = paper.text(stx + 85, sty + 2*vertspace, "");
    paper.oldv.covers.range.TO = paper.rect(stx + 80, sty + 2*vertspace - 10, 40, 20, 3)
    .click(function(e) {
        e.stopPropagation();
        var me = this;
        paper.oldradio.moveTo(1);
        paper.rules.oldv = new Array(2);
        paper.rules.oldv[0] = paper.oldv.texts.range.FROM.attr("text");
        paper.rules.oldv[1] = paper.oldv.texts.range.TO.attr("text");
        var BBox = this.getBBox();
        input = paper.oldv.texts.range.TO.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.oldv.texts.range.TO.inlineTextEditing.stopEditing(tasta);
            paper.rules.oldv[1] = paper.oldv.texts.range.TO.attr("text");
            me.toFront();
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.oldv.texts.range.TO);
    
    paper.oldv.texts.LOWESTTO = paper.text(stx + 85, sty + 3*vertspace, "");
    paper.oldv.covers.LOWESTTO = paper.rect(stx + 80, sty + 3*vertspace - 10, 40, 20, 3)
    .click(function(e) {
        e.stopPropagation();
        var me = this;
        paper.oldradio.moveTo(2);
        var BBox = this.getBBox();
        input = paper.oldv.texts.LOWESTTO.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.oldv.texts.LOWESTTO.inlineTextEditing.stopEditing(tasta);
            paper.rules.oldv = paper.oldv.texts.LOWESTTO.attr("text");
            me.toFront();
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.oldv.texts.LOWESTTO);
    
    paper.oldv.texts.TOHIGHEST = paper.text(stx + 19, sty + 4*vertspace, "");
    paper.oldv.covers.TOHIGHEST = paper.rect(stx + 14, sty + 4*vertspace - 10, 40, 20, 3)
    .click(function(e) {
        e.stopPropagation();
        var me = this;
        paper.oldradio.moveTo(3);
        var BBox = this.getBBox();
        input = paper.oldv.texts.TOHIGHEST.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.oldv.texts.TOHIGHEST.inlineTextEditing.stopEditing(tasta);
            paper.rules.oldv = paper.oldv.texts.TOHIGHEST.attr("text");
            me.toFront();
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.oldv.texts.TOHIGHEST);
    
    sat(paper.oldv.texts, {"clip": paper.oldv.covers});
    sat(paper.oldv.covers);
    
    paper.path([ 
        ["M", stx + 140, sty + 15],
        ["L", stx + 140, sty + 215]
    ]).attr({stroke: "#a0a0a0"});
    
    paper.newradio = paper.radio(stx + 180, sty + vertspace, -1, [
            "value",
            "missing",
            "copy old values"
            ], vertspace-10);
    
    paper.newradio.cover[0].click(function() {
        paper.rules.newv = paper.newv.texts.VALUE.attr("text");;
    });
    
    paper.newradio.cover[1].click(function() {
        paper.rules.newv = "missing";
    });
    
    paper.newradio.cover[2].click(function() {
        paper.rules.newv = "copy";
    });
    
    paper.newv.texts.VALUE  = paper.text(stx + 61 + 180, sty + vertspace, "");
    paper.newv.covers.VALUE = paper.rect(stx + 56 + 180, sty + vertspace - 10, 40, 20, 3)
    .attr({stroke: '#a0a0a0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0})
    .click(function(e) {
        e.stopPropagation();
        var me = this;
        paper.newradio.moveTo(0);
        var BBox = this.getBBox();
        input = paper.newv.texts.VALUE.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
        input.addEventListener("blur", function(e) {
            paper.newv.texts.VALUE.inlineTextEditing.stopEditing(tasta);
            paper.rules.newv = paper.newv.texts.VALUE.attr("text");
            me.toFront();
            tasta = "enter";
        });
    });
    paper.inlineTextEditing(paper.newv.texts.VALUE);
    
    sat(paper.newv.texts, {"clip": paper.newv.covers});
    sat(paper.newv.covers);
    
    paper.rect(stx + 159.5, sty + 151, 1, 6);
    paper.rect(stx + 157, sty + 153.5, 6, 1);
    
    paper.rect(stx + 157, sty + 173.5, 6, 1);
    
    sat(paper.rect(stx + 153, sty + 147, 14, 14), {"sw": 1.2}) 
    .click(function() {
        
        var rule;
        
        if (all(paper.rules.oldv, " != \"\"") && paper.rules.newv != "") {
            
            if (paper.oldradio.whichChecked == 1) { 
                rule = paper.rules.oldv[0] + ":" + paper.rules.oldv[1];
            }
            else if (paper.oldradio.whichChecked == 2) {
                rule = "lo:" + paper.rules.oldv;
            }
            else if (paper.oldradio.whichChecked == 3) {
                rule = paper.rules.oldv + ":hi";
            }
            else {
                rule = paper.rules.oldv;
            }
            
            var idx = recode.oldv.indexOf(rule);
            if (idx >= 0) {
                recode.newv[idx] = paper.rules.newv;
                var selected = getTrueKeys(colclicks.recode.rules);
                if (selected.length > 0) {
                    changeRule(colclicks, selected, rule + "=" + paper.rules.newv);
                }
            }
            else {
                recode.oldv.push(rule);
                recode.newv.push(paper.rules.newv);
            }
            
            if (colclicks.recode.rules != void 0) {
                unselect(colclicks, "recode", "rules");
            }
            
            eraseRecodeValues(paper);
            
            print_cols(papers["recrules"],
                       {
                            "dialog": "recode",
                            "identifier": "rules",
                            "selection": "multiple",
                            "cols": makeRules(recode.oldv, recode.newv),
                            "selectable": ["all"]
                       });
        }
        
        console_command("recode");
    });
    
    sat(paper.rect(stx + 153, sty + 167, 14, 14), {"sw": 1.2}) 
    .click(function() {
            
        var selected = getTrueKeys(colclicks.recode.rules);
        
        for (var i = 0; i < selected.length; i++) {
            var idx = recode.oldv.indexOf(selected[i].split("=")[0]);
            recode.oldv.splice(idx, 1);
            recode.newv.splice(idx, 1);
            
            deleteRule(colclicks, selected[i]);
        }
        
        papers["recrules"].clear();
        eraseRecodeValues(paper);
        
        if (recode.oldv.length > 0) {
            print_cols(papers["recrules"],
                       {
                            "dialog": "recode",
                            "identifier": "rules",
                            "selection": "multiple",
                            "cols": makeRules(recode.oldv, recode.newv),
                            "selectable": ["all"]
                       });
        }
        
        console_command("recode");
        
    });
    
    sat(paper.text(455, 265, "Run"));
    paper.rect(455 - 20, 265 - 13, 70, 25).attr({fill: "white", "fill-opacity": 0, 'stroke-width': 1.25})
         .click(function() {
             if (datainfo.rownames != "") {
                 recode.x = getTrueKeys(colclicks.recode.x)[0];
                 if (recode.x == void 0) {
                     recode.x = "";
                 }
                 
                 if (recode.x != "" && recode.newv.length > 0) {
                     recode.counter = 1 - recode.counter;
                     
                     outres[0] = "listen2R";
                     recode.scrollvh = scrollvh;
                     
                     Shiny.onInputChange("recode", recode);
                     
                     updatecounter = 0;
                     doWhenRresponds();
                 }
             }
         });
      
} 
} 

function draw_xyplot(paper) {
if ($("#xyplot").length) {
    var scale = 1;
    if (paper.scale != void 0) {
        scale = paper.scale;
    }
    
    if (paper.th != void 0) {
        paper.th.remove();
    }
    
    var labelRotation = 0;
    if (paper.labelRotation != void 0) {
        labelRotation = paper.labelRotation;
    }
    
    var randomjitter = new Array();
    if (paper.randomjitter != void 0) {
        if (getKeys(paper.randomjitter).length > 0) {
            randomjitter = paper.randomjitter;
        }
    }
    
    paper.clear();
    
    paper.xyplotdata = copyArray(xyplotdata);
    paper.randomjitter = randomjitter;
    
    paper.labelRotation = labelRotation;
    
    var stx = 13, sty = 10;
    
    sat(paper.text(stx, sty + 14 , "Condition X:"));
    sat(paper.text(stx, sty + 170, "Outcome Y:"));
    
    paper.scale = scale;
    paper.sx = 230;
    paper.sy = 20;
    paper.dim = 480; 
    paper.offset = 8;
    paper.rdim = paper.dim - 2*paper.offset;
    
    paper.negx = paper.checkBox(stx + 89, sty + 9, xyplot.negx, "negate");
    paper.negy = paper.checkBox(stx + 89, sty + 165, xyplot.negy, "negate");
    paper.index = 0;
    var powersof2 = 2;
    
    paper.negy.cover.click(function() {
        xyplot.negy = this.isChecked;
        powersof2 = Math.pow(2, (this.isChecked)?3:0) + Math.pow(2, (paper.negx.isChecked)?2:0);
        paper.index = [2, 5, 9, 12].indexOf(powersof2);
        paper.x = xyplot.x;
        paper.y = xyplot.y;
        scaleplot(paper);
        createLabels(paper);
    });
    
    paper.negx.cover.click(function() {
        xyplot.negx = this.isChecked;
        powersof2 = Math.pow(2, (paper.negy.isChecked)?3:0) + Math.pow(2, (this.isChecked)?2:0);
        paper.index = [2, 5, 9, 12].indexOf(powersof2);
        paper.x = xyplot.x;
        paper.y = xyplot.y;
        scaleplot(paper);
        createLabels(paper);
    });
    
    paper.sufnec = paper.radio(stx + 7, sty + 325, ["sufficiency", "necessity"].indexOf(xyplot.sufnec), ["sufficiency", "necessity"]);
    
    paper.pof = paper.checkBox(stx + 1, sty + 375, xyplot.pof, "parameters of fit");
    paper.mdguides = paper.checkBox(stx + 1, sty + 400, xyplot.mdguides, "show middle guides");
    paper.fill = paper.checkBox(stx + 1, sty + 425, xyplot.fill, "fill points");
    paper.jitter = paper.checkBox(stx + 1, sty + 450, xyplot.jitter, "jitter points");
    paper.labels = paper.checkBox(stx + 1, sty + 475, xyplot.labels, "show case labels");
    
    paper.sufnec.cover[0].click(function() {
        xyplot.sufnec = "sufficiency";
        if (xyplotdata.length > 0) {
            paper.incl.attr({"text": ("Inclusion: " + xyplotdata[3][paper.index][0])});
            paper.cov.attr({"text": ("Coverage: " + xyplotdata[3][paper.index][1])});
            paper.PRI.attr({"text": ("PRI: " + xyplotdata[3][paper.index][2])});
            paper.measures.show();
            paper.ron.hide();
        }
    });
    
    paper.sufnec.cover[1].click(function() {
        xyplot.sufnec = "necessity";
        if (xyplotdata.length > 0) {
            paper.incl.attr({"text": ("Inclusion: " + xyplotdata[4][paper.index][0])});
            paper.cov.attr({"text": ("Coverage: " + xyplotdata[4][paper.index][1])});
            paper.ron.attr({"text": ("Relevance: " + xyplotdata[4][paper.index][2])});
            paper.measures.show();
            paper.PRI.hide();
        }
    });
    
    paper.measures = paper.set();
    paper.incl = sat(paper.text(paper.sx + 2, 10, "Inclusion: "));
    paper.cov = sat(paper.text(paper.sx + 122, 10, "Coverage: "));
    paper.PRI = sat(paper.text(paper.sx + 250, 10, "PRI: "));
    paper.ron = sat(paper.text(paper.sx + 250, 10, "Relevance: "));
    
    paper.measures.push(paper.incl, paper.cov, paper.PRI, paper.ron);
    paper.measures.hide();
    
    if (xyplot.pof && xyplotdata.length > 0) {
        paper.measures.show();
        if (xyplot.sufnec == "sufficiency") {
            paper.ron.hide();
        }
    }
    
    paper.mdguides.cover.click(function() {
        xyplot.mdguides = paper.mdguides.isChecked;
        if (xyplot.mdguides) {
            paper.mdlines.show();
        }
        else {
            paper.mdlines.hide();
        }
        
    });
    
    paper.jitter.cover.click(function() {
        xyplot.jitter = this.isChecked;
        if (paper.xyplotdata.length > 0) {
            paper.randomjitter.x = new Array(paper.xyplotdata[0].length);
            paper.randomjitter.y = new Array(paper.xyplotdata[0].length);
            if (this.isChecked) {
                for (var i = 0; i < paper.xyplotdata[0].length; i++) {
                    paper.randomjitter.x[i] = randomBetween(-5, 5);
                    paper.randomjitter.y[i] = randomBetween(-5, 5);
                }
            }
            else {
                for (var i = 0; i < paper.xyplotdata[0].length; i++) {
                    paper.randomjitter.x[i] = 0;
                    paper.randomjitter.y[i] = 0;
                }
            }
        }
        scaleplot(paper);
        createLabels(paper);
    });
    
    paper.fill.cover.click(function() {
        xyplot.fill = paper.fill.isChecked;
        if (xyplot.fill) {
            paper.pointsset.attr({"fill-opacity": 1});
        }
        else {
            paper.pointsset.attr({"fill-opacity": 0});
        }
        
    });    
    
    paper.pof.cover.click(function() {
        xyplot.pof = this.isChecked;
        if (xyplot.pof && xyplotdata.length > 0) {
            paper.measures.show();
            if (xyplot.sufnec == "sufficiency") {
                paper.ron.hide();
            }
        }
        else {
            paper.measures.hide();
        }
        
    });
    
    paper.labels.cover.click(function() {
        xyplot.labels = paper.labels.isChecked;
        if (xyplot.labels) {
            paper.labelsset.show();
            paper.thsetter.show();
        }
        else {
            paper.labelsset.hide();
            paper.thsetter.hide();
        }
    });
    
    paper.thsetter = paper.set();
    paper.thsetter.push(sat(paper.text(stx + 20, sty + 505, "rotate")));
    paper.thsetter.push(paper.path("M" + (stx + 70) + "," + (sty + 505) + "L" + (stx + 145) + "," + (sty + 505)));
    
    paper.th = paper.path("M" + (stx + 70 + paper.labelRotation) + "," + (sty + 505) + "L" + (stx + 70 + paper.labelRotation - 5) + "," + (sty + 512) + "L" + (stx + 70 + paper.labelRotation + 5) + "," + (sty + 512) + "L" + (stx + 70 + paper.labelRotation) + "," + (sty + 505)).attr({"stroke-width": 1.5, fill: "#cb2626", stroke: "#cb2626"});
    paper.th.min = 0; 
    paper.th.max = 45; 
    paper.th.left = stx + 70;
    paper.th.right = stx + 145;
    paper.th.id = "xyplot";
    paper.th.drag(dragMove(paper.th), dragStart, dragStop(paper.th));
    paper.thsetter.push(paper.th);
    
    paper.labelsset = paper.set();
    
    if (!xyplot.labels) {
        paper.labelsset.hide();
        paper.thsetter.hide();
    }
    
    paper.labelsArray = new Array();
    
    paper.x = xyplot.x;
    paper.y = xyplot.y;
    scaleplot(paper);
    createLabels(paper);
    
} 
} 

function draw_venn(paper) {
    
    var glow, txt, txtfundal;
    
    function hoverVenn_IN() {
        if (this.txt != "" && paper.hover) {
            
            glow = this.glow({
                color: "#0000ff",
                width: 2
            });
            glow.toFront();
            
            var BBox = this.getBBox();
            var xcoord = BBox.x;
            var ycoord = BBox.y - 20;
            
            if (ycoord < 0) {
                xcoord = BBox.x + 20;
                ycoord = BBox.y + 20;
            }
            
            txt = papers["venn_main"].paragraph({
                x: xcoord,
                y: ycoord,
                maxWidth: 200,
                text: this.txt.split(",").join(", "),
                textStyle: {
                    "font-family" : "Arial",
                    "font-size" : 14,
                    "text-anchor" : "start",
                    "font-weight" : "bold"
                }
            });
            
            var BBox2 = txt.getBBox();
            
            txtfundal = papers["venn_main"].rect(xcoord - BBox2.width/2, ycoord - 1, BBox2.width + 10, BBox2.height + 5);
            txtfundal.attr({fill: "#c9c9c9", "fill-opacity": 0.8, stroke: "none"});
            txt.toFront();
            txtfundal.translate(BBox2.width/2 - 5, -10);
            txt.show();
            
        }
        
    }
    
    function hoverVenn_OUT() {
        if (this.txt != "") {
            glow.remove();
            txt.remove();
            txtfundal.remove();
        }
    }
    
    function getCentroid(path) {
        var x = new Array(11);
        var y = new Array(11);
        var asum = 0, cxsum = 0, cysum = 0;
        var totlength = path.getTotalLength();
        for (var i = 0; i < 11; i++) {
            var location = path.getPointAtLength(i*totlength/10);
            x[i] = location.x;
            y[i] = location.y;
            
            if (i > 0) {
                asum += x[i - 1]*y[i] - x[i]*y[i - 1];
                cxsum += (x[i - 1] + x[i])*(x[i - 1]*y[i] - x[i]*y[i - 1]);
                cysum += (y[i - 1] + y[i])*(x[i - 1]*y[i] - x[i]*y[i - 1]);
            }
        }
        
        return({x: (1/(3*asum))*cxsum, y: (1/(3*asum))*cysum});
        
    }
    
    if ($("#venn").length) {
        
        paper.hover = true;
        
        if (getKeys(ttfromR).length > 0) {
            
            var vcolors = {
                "0": "#ffd885", 
                "1": "#96bc72", 
                "C": "#1c8ac9", 
                "?": "white"
            };
            
            if (paper.scale === undefined) {
                paper.scale = (Math.min($(paper.canvas).width() - 20, $(paper.canvas).height() - 70))/1000;;
            }
            
            if (paper.customtext === undefined) {
                paper.customtext = "";
            }
            
            if (paper.custom === undefined) {
                paper.custom = false;
            }
            
            paper.clear();
            
            var vennumber = ttfromR.options.conditions.length;
            
            var tosplit, BBox, BBox2, inIndexes, glow;
            
            var allshapes = paper.set();
            var boxset = paper.set();
            var borderset = paper.set();
            var labelsGroup = paper.set();
            var hoverGroup = paper.set();
            var colored = paper.set();
            
            var rule = paper.set();
            var customSet = paper.set();
            var customHover = paper.set();
            var customNonHover = paper.set();
            
            var temp = paper.rect(0, 0, 1000*paper.scale, 1000*paper.scale);
            borderset.push(temp);
            
            for (var i = 0; i < venn["s" + vennumber][0].length; i++) {
                
                var path = "M";
                var y = venn["s" + vennumber][0][i];
                for (var j = 0; j < y.length/2; j++) {
                    path += ((j == 1)?" C ":" ") + (y[2*j]*paper.scale) + "," + (y[2*j + 1]*paper.scale);
                }
                
                var temp = paper.path(path);
                borderset.push(temp);
                
            }
            
            for (var i = 0; i < vennumber; i++) {
                var templabel = sat(paper.text(venn[("l" + vennumber)].x[i]*paper.scale, venn[("l" + vennumber)].y[i]*paper.scale, ttfromR.options.conditions[i]), {anchor: "middle"});
                labelsGroup.push(templabel);
            }
            
            for (var i = 0; i < ttfromR.id.length; i++) {
                var tempath = getShape([venn["s" + vennumber][1][i]], venn["s" + vennumber][0], paper.scale);
                
                if (i == 0) {
                    tempath = "M 0,0 0," + 1000*paper.scale + " " + 1000*paper.scale + "," + 1000*paper.scale + " " + 1000*paper.scale + ",0 0,0 z " + tempath;
                }
                
                var temp = paper.path(tempath).attr({fill: vcolors[ttfromR.tt.OUT[i]], stroke: "none"});
                BBox = temp.getBBox();
                
                var centroid = getCentroid(temp);
                
                if (ttfromR.id.length == 16) {
                    if (i == 1) {
                        centroid.x += 20*paper.scale;
                        centroid.y -= 75*paper.scale;
                    }
                    else if (i == 8) {
                        centroid.x -= 20*paper.scale;
                        centroid.y -= 75*paper.scale;
                    }
                }
                
                var templabel;
                if (i == 0) {
                    templabel = sat(paper.text(20, 20, ttfromR.id[i]), {size: 8, anchor: "middle"});
                }
                else {
                    templabel = sat(paper.text(centroid.x, centroid.y, ttfromR.id[i]), {size: 8, anchor: "middle"});
                }
                
                labelsGroup.push(templabel);
                allshapes.push(temp);
                
                if (ttfromR.cases[i] != "") {
                    var hoverPath = temp.clone().attr({fill: "#fff", "fill-opacity": 0, stroke: "none"});
                    hoverGroup.push(hoverPath);
                    hoverPath.txt = ttfromR.tt.cases[i];
                    hoverPath.hover(hoverVenn_IN, hoverVenn_OUT, hoverPath, hoverPath);
                    colored.push(temp);
                }
                
            }
            
            allshapes.push(labelsGroup, hoverGroup, borderset);
            
            BBox = allshapes.getBBox();
            allshapes.transform("t10, 35");
             
            BBox = allshapes.getBBox();
            
            var colorsCols = getKeys(vcolors);
            for (var i = 0; i < colorsCols.length; i++) {
                colored.push(paper.rect(BBox.x + 50*i, BBox.y + BBox.height + 12, 11, 11)
                    .attr({fill: vcolors[colorsCols[i]]}));
                colored.push(sat(paper.text(BBox.x + 50*i + 18, BBox.y + BBox.height + 18, colorsCols[i])));
            }
            
            var custom = paper.checkBox(10, 10, paper.custom, "custom");
            
            custom.cover.click(function() {
                if (custom.isChecked) {
                    paper.custom = true;
                    colored.hide();
                    hoverGroup.hide();
                    rule.show();
                    customSet.show();
                    if (glow !== undefined) {
                        glow.show();
                    }
                    customHover.toFront();
                    customNonHover.toFront();
                }
                else {
                    paper.custom = false;
                    colored.show();
                    hoverGroup.show();
                    rule.hide();
                    customSet.hide();
                    if (glow !== undefined) {
                        glow.hide();
                    }
                    hoverGroup.toFront();
                }
            });
            
            var ruletext = sat(paper.text(90, 16, paper.customtext), {"clip": "85, 7, 334, 20"});
            var rulerect = paper.rect(85, 6, 335, 20).attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            rule.push(ruletext, rulerect);
            
            if (paper.customtext != "") {
                var parsedText = parseText(paper.customtext, ttfromR.options.conditions);
                
                if (parsedText != "error") {
                    if (glow !== undefined) {
                        glow.remove();
                    }
                    
                    var cols = getKeys(parsedText);
                    var inverted = new Array(cols.length);   
                    var Hovers = new Array(cols.length);
                    for (var i = 0; i < cols.length; i++) {
                        var tempinv;
                        var temp = customShape(parsedText[cols[i]],
                                               venn["s" + vennumber],
                                               paper.scale,
                                               ttfromR.id);
                        if (temp[1]) { 
                            temp[0] = paper.path("M 0,0 0," + 1000*paper.scale + " " + 1000*paper.scale + "," + 1000*paper.scale + " " + 1000*paper.scale + ",0 0,0 z " + temp[0])
                            .attr({fill: vcolors["1"], stroke: "none", "fill-opacity": 0.75});
                        }
                        else {
                            temp[0] = paper.path(temp[0]).attr({fill: vcolors["1"], stroke: "none", "fill-opacity": 0.75});
                        }
                        
                        inverted[i] = temp[1];
                        
                        Hovers[i] = temp[0].clone().attr({fill: "#fff", "fill-opacity": 0, stroke: "none"});
                        Hovers[i].txt = cols[i];
                        Hovers[i].hover(hoverVenn_IN, hoverVenn_OUT, Hovers[i], Hovers[i]);
                        customHover.push(Hovers[i]);
                        customSet.push(temp[0], Hovers[i]);
                        
                    }
                    
                    customSet.transform("t10, 35");
                    
                    labelsGroup.toFront();
                    borderset.toFront();
                    customHover.toFront();
                    
                    for (i = 0; i < cols.length; i++) {
                        if (!inverted[i]) {
                            Hovers[i].toFront();
                        }
                    }
                    
                }
                else {
                    if (glow === undefined) {
                        glow = rulerect.glow({
                            color: "#ff0000",
                            width: 4
                        });
                    }
                }
                rulerect.toFront();
            }
            
            rulerect.click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = ruletext.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    ruletext.inlineTextEditing.stopEditing(tasta);
                    if (ruletext.attr("text") != paper.customtext) {
                        paper.customtext = ruletext.attr("text");
                        customSet.remove();
                        customHover.remove();
                        
                        customSet = paper.set();
                        customHover = paper.set();
                        
                        if (glow !== undefined) {
                            glow.remove();
                        }
                        
                        if (ruletext.attr("text") != "") {
                            var tempinv;
                            var parsedText = parseText(paper.customtext, ttfromR.options.conditions);
                            
                            if (parsedText != "error") {
                                
                                var cols = getKeys(parsedText);
                                var inverted = new Array(cols.length);   
                                var Hovers = new Array(cols.length);
                                for (var i = 0; i < cols.length; i++) {
                                    
                                    var temp = customShape(parsedText[cols[i]],
                                               venn["s" + vennumber],
                                               paper.scale,
                                               ttfromR.id);
                                    
                                    if (temp[1]) { 
                                        temp[0] = paper.path("M 0,0 0," + 1000*paper.scale + " " + 1000*paper.scale + "," + 1000*paper.scale + " " + 1000*paper.scale + ",0 0,0 z " + temp[0])
                                        .attr({fill: vcolors["1"], stroke: "none", "fill-opacity": 0.75});
                                    }
                                    else {
                                        temp[0] = paper.path(temp[0]).attr({fill: vcolors["1"], stroke: "none", "fill-opacity": 0.75});
                                    }
                                    
                                    inverted[i] = temp[1];
                                    
                                    Hovers[i] = temp[0].clone().attr({fill: "#fff", "fill-opacity": 0}); 
                                    
                                    Hovers[i].txt = cols[i];
                                    Hovers[i].hover(hoverVenn_IN, hoverVenn_OUT, Hovers[i], Hovers[i]);
                                    customHover.push(Hovers[i]);
                                    customSet.push(temp[0], Hovers[i]);
                                    
                                }
                                
                                customSet.transform("t10,35");
                                
                                labelsGroup.toFront();
                                borderset.toFront();
                                customHover.toFront();
                                
                                for (i = 0; i < cols.length; i++) {
                                    if (!inverted[i]) {
                                        console.log(Hovers[i].txt);
                                        Hovers[i].toFront();
                                    }
                                }
                                
                            }
                            else {
                                glow = rulerect.glow({
                                    color: "#ff0000",
                                    width: 4
                                });
                            }
                        }
                    }
                    tasta = "enter";
                })
            });
            
            paper.inlineTextEditing(ruletext);
            
            if (paper.custom) {
                colored.hide();
                hoverGroup.hide();
                customSet.show();
                if (glow !== undefined) {
                    glow.show();
                }
            }
            else {
                colored.show();
                hoverGroup.show();
                customSet.hide();
                rule.hide();
                if (glow !== undefined) {
                    glow.hide();
                }
            }
            
            labelsGroup.toFront();
            borderset.toFront();
            hoverGroup.toFront();
            
        } 
    } 
    
} 

function draw_tt(paper) {
    
    if ($("#tt").length) {
    
        paper.clear();
        
        paper.text(13, 18, "Outcome:").attr({"text-anchor": "start", "font-size": "14px"});
        paper.text(233, 18, "Conditions:").attr({"text-anchor": "start", "font-size": "14px"});
        
        var stx = 14;
        var sty = 175;
        
        var neg_out = paper.checkBox(stx, sty + 25 - 14, tt.neg_out, "negate outcome");
        neg_out.cover.click(function() {
            tt.neg_out = neg_out.isChecked;
            console_command("tt");
        });
        
        var complete = paper.checkBox(stx, sty + 50 - 14, tt.complete, "complete");
        complete.cover.click(function() {
            tt.complete = complete.isChecked;
            console_command("tt");
        });
        
        var show_cases = paper.checkBox(stx, sty + 75 - 14, tt.show_cases, "show cases");
        show_cases.cover.click(function() {
            tt.show_cases = show_cases.isChecked;
            console_command("tt");
        });
        
        var use_letters = paper.checkBox(stx, sty + 100 - 14, tt.use_letters, "use letters");
        use_letters.cover.click(function() {
            tt.use_letters = use_letters.isChecked;
            console_command("tt");
        });
        
        sat(paper.text(stx + 160, sty + 6, "Sort by:"));
        paper.decr = sat(paper.text(stx + 240, sty + 6, "Decr."));
        paper.decr.hide();
        
        paper.rect(stx + 152, sty + 18.5, 78, 77)
           .attr({stroke: '#d0d0d0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0});
        
        paper.decrease = new Array(3);
        paper.rects = new Array(6);
        paper.texts = new Array(3);
        paper.positions = new Array(3);
        paper.coordsy = new Array(3);
        paper.sortsets = new Array(3);
        
        var keys = getKeys(tt.sort_by);
        var sortbyoptions = {"out": "outcome", "incl": "inclusion", "n": "frequency"};
        
        for (var i = 0; i < 3; i++) {
            paper.sortsets[i] = paper.set();
            
            paper.positions[i] = i;
            paper.coordsy[i] = sty + 20 + i*25;
            
            paper.rects[i] = paper.rect(stx + 154, paper.coordsy[i], 74, 24);
            paper.rects[i].backcolor = tt.sort_sel[keys[i]];
            paper.texts[i] = sat(paper.text(stx + 160, sty + 31 + i*25, sortbyoptions[keys[i]]));
            
            if (tt.sort_sel[keys[i]]) {
                paper.rects[i].attr({fill: "#79a74c", stroke: "none"});
                paper.texts[i].attr({fill: "white", "text-anchor": "start", "font-size": "14px"});
            }
            else {
                paper.rects[i].attr({fill: "#eeeeee", stroke: "none"});
                paper.texts[i].attr({fill: "black", "text-anchor": "start", "font-size": "14px"});
            }
            
            paper.sortsets[i].push(paper.rects[i], paper.texts[i]);
        }
        
        for (var i = 0; i < 3; i++) {
            paper.rects[3 + i] = paper.rect(stx + 154, paper.coordsy[i], 74, 24)
                .attr({stroke: 'none', fill: "#ffffff", "fill-opacity": 0});
            
            paper.rects[3 + i].id = i;
            paper.rects[3 + i].name = keys[i];
            paper.rects[3 + i].top = stx + 200 - 4;
            paper.rects[3 + i].bottom = stx + 250 - 4;
            
            paper.sortsets[i].push(paper.rects[3 + i]);
            
            paper.decrease[i] = paper.checkBox(stx + 248, paper.coordsy[i] + 5, tt.sort_by[keys[i]], "");
            paper.decrease[i].cover.name = keys[i];
            paper.decrease[i].cover.click(function() {
                tt.sort_by[this.name] = this.isChecked;
                console_command("tt");
            });
            
            if (!tt.sort_sel[keys[i]]) {
                paper.decrease[i].hideIt();
            }
            
            paper.sortsets[i].drag(dragSortMove(paper.sortsets[i]), dragSortStart(paper.sortsets[i]), dragSortStop(paper.sortsets[i]));
            
        }
        
        if (getTrueKeys(tt.sort_sel).length == 0) {
            papers["tt_main"].decr.hide();
        }
        else {
            papers["tt_main"].decr.show();
        }
        
        var ctx = 396; 
        var cty = 180; 
        
        paper.text(ctx, cty, "cut-off:").attr({"text-anchor": "start", "font-size": "14px"});
        paper.text(ctx - 15, cty + 25, "Frequency").attr({"text-anchor": "end", "font-size": "14px"});
        
        var frequency = paper.text(ctx + 5, cty + 25, tt.n_cut).attr({"text-anchor": "start", "font-size": "14px"});
        var frequency_rect = paper.rect(ctx, cty + 15, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = frequency.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    frequency.inlineTextEditing.stopEditing(tasta);
                    tt.n_cut = frequency.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("tt");
                });
            });
        paper.inlineTextEditing(frequency);
        
        paper.text(ctx - 15, cty + 50, "Inclusion 1").attr({"text-anchor": "end", "font-size": "14px"});
        var inclcut1 = paper.text(ctx + 5, cty + 50, tt.ic1).attr({"text-anchor": "start", "font-size": "14px"});
        paper.rect(ctx, cty + 40, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut1.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut1.inlineTextEditing.stopEditing(tasta);
                    tt.ic1 = inclcut1.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("tt");
                });
            });
        paper.inlineTextEditing(inclcut1);
        
        paper.text(ctx - 15, cty + 75, "Inclusion 0").attr({"text-anchor": "end", "font-size": "14px"});
        var inclcut0 = paper.text(ctx + 5, cty + 75, tt.ic0).attr({"text-anchor": "start", "font-size": "14px"});
        paper.rect(ctx, cty + 65, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut0.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut0.inlineTextEditing.stopEditing(tasta);
                    tt.ic0 = inclcut0.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("tt");
                });
            });
        paper.inlineTextEditing(inclcut0);
        
        paper.text(ctx + 3, cty + 114, "Run").attr({"text-anchor": "start", "font-size": "14px"});
        paper.rect(ctx - 20, cty + 101, 70, 25)
        .attr({fill: "white", "fill-opacity": 0, 'stroke-width': 1.25})
        .click(function() {
            if (datainfo.rownames != "") {
                console_command("tt");
                tt.outcome = getTrueKeys(colclicks.tt.outcome);
                tt.conditions = getTrueKeys(colclicks.tt.conditions);
                tt2R = tt;
                
                tt2R.counter += 1;
                
                outres[0] = "listen2R";
                
                Shiny.onInputChange("tt2R", tt2R);
                updatecounter = 0;
                printWhenOutputChanges()
            }
        });
        
    }
}

function draw_eqmcc(paper) {
    
    if ($("#eqmcc").length) {
        paper.clear();
    
        sat(paper.text(14, 18, "Outcome:"));
        sat(paper.text(234, 18, "Conditions:"));
        paper.direxpl = sat(paper.text(18, 283, ""));
        
        var expx = 17;
        var expy = 172;
        
        sat(paper.text(expx, expy, "Explain:"));
        paper.rect(expx + 3.5, expy + 11, 38, 82)
                   .attr({stroke: '#d0d0d0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0});
        
        sat(paper.text(expx + 61, expy, "Include:"));
        paper.rect(expx + 65.5, expy + 11, 38, 82)
                   .attr({stroke: '#d0d0d0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0});
        
        var expinc = ["0", "1", "?", "C"];
        
        var rects = new Array(20);
        var texts = new Array(10);
        var selected = false;
        
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 4; j++) {
                selected = eqmcc[(i==0)?"explain":"include"].indexOf(expinc[j]) >= 0;
                rects[i*4 + j] = paper.rect(expx + 5.5 + i*62, expy + 12.5 + j*20, 34, 19).attr({fill: selected?"#79a74c":"#eeeeee", stroke: 'none'});
                rects[i*4 + j].backcolor = selected;
                texts[i*4 + j] = paper.text(expx + 17 + i*62, expy + 21.5 + j*20, expinc[j]).attr({"text-anchor": "start", "font-size": "14px", fill: selected?"white":"black"});
            }
        }      
        
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 4; j++) {
                rects[8 + i*4 + j] = paper.rect(10 + i*62, expy + 10.5 + j*20, 35, 20)
                    .attr({stroke: 'none', fill: "#ffffff", "fill-opacity": 0})
                    .click(function() {
                        if (rects[this.id].backcolor) {
                            rects[this.id].attr({fill: "#eeeeee", stroke: "none"});
                            texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: "black"});
                        }
                        else {
                            rects[this.id].attr({fill: "#79a74c", stroke: "none"});
                            texts[this.id].attr({"text-anchor": "start", "font-size": "14px", fill: "white"});
                        }
                        rects[this.id].backcolor = !rects[this.id].backcolor;
                        
                        var value = expinc[this.id % 4];
                        if (this.id < 4) { 
                            var index = eqmcc.explain.indexOf(value);
                            if (index > -1) {
                                eqmcc.explain.splice(index, 1);
                            }
                            else {
                                eqmcc.explain.push(value);
                            }
                        }
                        else { 
                            var index = eqmcc.include.indexOf(value);
                            if (index > -1) {
                                eqmcc.include.splice(index, 1);
                            }
                            else {
                                eqmcc.include.push(value);
                            }
                            filldirexp();
                        }
                        console_command("eqmcc");
                    });
                rects[8 + i*4 + j].id = i*4 + j;
            }
        }
        
        var neg_out = paper.checkBox(expx + 147, expy + 5, eqmcc.neg_out, "negate outcome");
        neg_out.cover.click(function() {
            eqmcc.neg_out = neg_out.isChecked;
            console_command("eqmcc");
        });
        
        var details = paper.checkBox(expx + 147, expy + 5 + 25, eqmcc.details, "show details");
        details.cover.click(function() {
            eqmcc.details = details.isChecked;
            console_command("eqmcc");
        });
        
        var show_cases = paper.checkBox(expx + 147, expy + 5 + 50, eqmcc.show_cases, "show cases");
        show_cases.cover.click(function() {
            eqmcc.show_cases = show_cases.isChecked;
            console_command("eqmcc");
        });
        
        var all_sol = paper.checkBox(expx + 147, expy + 5 + 75, eqmcc.all_sol, "maximal solutions");
        all_sol.cover.click(function() {
            eqmcc.all_sol = all_sol.isChecked;
            if (all_sol.isChecked) {
                row_dom.uncheck();
                eqmcc.row_dom = false;
            }
            console_command("eqmcc");
        });
        
        var use_tilde = paper.checkBox(expx + 307, expy + 5, eqmcc.use_tilde, "use tilde");
        use_tilde.cover.click(function() {
            eqmcc.use_tilde = use_tilde.isChecked;
            console_command("eqmcc");
        });
        
        var use_letters = paper.checkBox(expx + 307, expy + 5 + 25, eqmcc.use_letters, "use letters");
        use_letters.cover.click(function() {
            eqmcc.use_letters = use_letters.isChecked;
            console_command("eqmcc");
        });
        
        var row_dom = paper.checkBox(expx + 307, expy + 5 + 50, eqmcc.row_dom, "PI dominance");
        row_dom.cover.click(function() {
            eqmcc.row_dom = row_dom.isChecked;
            if (row_dom.isChecked) {
                all_sol.uncheck();
                eqmcc.all_sol = false;
            }
            console_command("eqmcc");
        });
        
        sat(paper.text(expx + 168, expy + 115 + 5, "Relation:"));
        
        var relation = paper.radio(expx + 155, expy + 141 + 5, 1*(eqmcc.relation == "sufnec"), ["sufficiency", ""], 33);
        sat(paper.text(expx + 168, expy + 166 + 5, "sufficiency and"));
        sat(paper.text(expx + 168, expy + 181 + 5, "necessity"));
        
        relation.cover[0].click(function() {
            eqmcc.relation = "suf";
            console_command("eqmcc");
        });
        
        relation.cover[1].click(function() {
            eqmcc.relation = "sufnec";
            console_command("eqmcc");
        });
        
        sat(paper.text(expx + 380, expy + 90 + 5, "cut-off:"));
        
        sat(paper.text(expx + 365, expy + 115 + 5, "Frequency"), {anchor: "end"});
        var frequency = sat(paper.text(expx + 385, expy + 115 + 5, eqmcc.n_cut));
        paper.rect(expx + 380, expy + 105 + 5, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(event) {
                event.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = frequency.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    frequency.inlineTextEditing.stopEditing(tasta);
                    eqmcc.n_cut = frequency.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("eqmcc");
                });
            });
        paper.inlineTextEditing(frequency);
        
        sat(paper.text(expx + 365, expy + 140 + 5, "Inclusion 1"), {anchor: "end"});
        var inclcut1 = sat(paper.text(expx + 385, expy + 140 + 5, eqmcc.ic1));
        paper.rect(expx + 380, expy + 130 + 5, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut1.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut1.inlineTextEditing.stopEditing(tasta);
                    eqmcc.ic1 = inclcut1.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("eqmcc");
                });
            });
        paper.inlineTextEditing(inclcut1);
        
        sat(paper.text(expx + 365, expy + 125 + 40 + 5, "Inclusion 0"), {anchor: "end"});
        var inclcut0 = sat(paper.text(expx + 385, expy + 125 + 40 + 5, eqmcc.ic0));
        paper.rect(expx + 380, expy + 115 + 40 + 5, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut0.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut0.inlineTextEditing.stopEditing(tasta);
                    eqmcc.ic0 = inclcut0.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("eqmcc");
                });
            });
        paper.inlineTextEditing(inclcut0);
        
        sat(paper.text(expx + 383, expy + 214, "Run"));
        paper.rect(expx + 360, expy + 201, 70, 25)
        .attr({fill: "white", "fill-opacity": 0, 'stroke-width': 1.25})
        .click(function() {
            if (datainfo.rownames != "") {
                console_command("eqmcc");
                eqmcc.outcome = getTrueKeys(colclicks.eqmcc.outcome);
                eqmcc.conditions = getTrueKeys(colclicks.eqmcc.conditions);
                eqmcc2R = eqmcc;
                
                eqmcc2R.counter += 1;
                
                outres[0] = "listen2R";
                
                Shiny.onInputChange("eqmcc2R", eqmcc2R);
                updatecounter = 0;
                printWhenOutputChanges();
            }
        });
        
    }
}

function filldirexp() {
    
    if ($("#eqmcc").length) {
        papers["direxp"].clear();
        papers["direxp"].setSize(200, 20);
        var print = false;
        
        var inclrem = eqmcc.include.indexOf("?") >= 0;
        
        if (getKeys(colclicks).length > 0) {
            eqmcc.outcome = getTrueKeys(colclicks.eqmcc.outcome);
            eqmcc.conditions = getTrueKeys(colclicks.eqmcc.conditions);
        }
        
        var condselected = eqmcc.conditions.length > 0;
        var singleoutcome = eqmcc.outcome.length == 1;
        
        if (inclrem) {
            if (condselected) {
                print = true;
            }
            else {
                if (singleoutcome) {
                    print = true;
                }
            }
        }
        
        if (print) {
            
            papers["eqmcc_main"].direxpl.attr({"text": "Directional exps:"});
            var conds = eqmcc.conditions;
            
            if (conds.length == 0) {
                if (singleoutcome) {
                    var colnames = new Array(datainfo.colnames.length);
                    
                    for (var i = 0; i < datainfo.colnames.length; i++) {
                        colnames[i] = datainfo.colnames[i];
                    }
                    
                    var index = colnames.indexOf(eqmcc.outcome[0]);
                    if (index >= 0) { 
                        colnames.splice(index, 1);
                    }
                    conds = colnames;
                }
            }
            
            var celltext = new Array(conds.length);
            var cellcover = new Array(conds.length);
            var colnms = new Array(conds.length);
            
            if (eqmcc.dir_exp.length != conds.length) {
                eqmcc.dir_exp = new Array(conds.length);
                for (var i = 0; i < conds.length; i++) {
                    eqmcc.dir_exp[i] = "-";
                }
            }
            
            for (var i = 0; i < conds.length; i++) {
                colnms[i] = papers["direxp"].text(3, i*20 + 11, conds[i]).attr({"text-anchor": "start", "font-size": "14px"});
                if (colnms[i].getBBox().width > 52) {
                    colnms[i].attr("text", getTrimmedText(colnms[i].attr("text"), 52));
                }
                
                celltext[i]  = papers["direxp"].text(73, i*20 + 11, eqmcc.dir_exp[i]).attr({"text-anchor": "start", "font-size": "14px"});
                cellcover[i] = papers["direxp"].rect(68, i*20 + 1, 38, 20, 3)
                    .attr({fill: "#ffffff", stroke: "#d7d7d7", "fill-opacity": "0"});
                cellcover[i].idx = i;
                papers["direxp"].inlineTextEditing(celltext[i]);
                cellcover[i].click(function(e) {
                    e.stopPropagation();
                    var temp = celltext[this.idx].attr("text");
                    
                    ovBox = this.getBBox();
                    input = celltext[this.idx].inlineTextEditing.startEditing(ovBox.x, ovBox.y - $("#direxp").scrollTop(), ovBox.width, ovBox.height, "from_filldirexp");
                    input.idx = this.idx;
                    input.addEventListener("blur", function(e) {
                        celltext[this.idx].inlineTextEditing.stopEditing(tasta);
                        
                        if (celltext[this.idx].attr("text") == "") {
                            celltext[this.idx].attr({"text": "-"})
                        }
                        
                        if (temp != celltext[this.idx].attr("text")) {
                            
                            eqmcc.dir_exp[this.idx] = celltext[this.idx].attr("text");
                            console_command("eqmcc");
                        }
                        tasta = "enter";
                    })
                })
            }
            $(papers["direxp"].canvas).height(20*conds.length + 2);
        }
        else {
            eqmcc.dir_exp= new Array();
            papers["eqmcc_main"].direxpl.attr({"text": ""});
        }
    }
}

function checkIfDataLoadedInR() {
    
    updatecounter += 1;
    
    if (updatecounter < 101) { 
        if (tempdatainfo.nrows > 0) {
            refresh_cols("import");
            updatecounter = 0; 
        }
        else {
            setTimeout(checkIfDataLoadedInR, 50);
        }
    }
    else {
        
        if (rloadcycles == 0) {
            $("#result_main").append("<br><br><span style='color:red'>Warning: R takes rather long to load the data...</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 1) {
            $("#result_main").append("<br><span style='color:red'>Warning: R still takes long to load the data...</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 2) {
            $("#result_main").append("<br><span style='color:red'>Warning: is this such a big dataset...?</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 3) {
            $("#result_main").append("<br><span style='color:red'>Warning: we're getting bored here...</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 4) {
            $("#result_main").append("<br><span style='color:red'>Error: OK I give up. It's just too long.</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            rloadcycles = 0;
        }
        
        updatecounter = 0; 
        
    }
}

function consoleIfPathChanges() {
    
    updatecounter2 += 1;
    
    if (updatecounter2 < 21) { 
        if (dirfile.filepath[0][0] != pathcopy[0][0]) {
            
            console_command(current_command);
            updatecounter2 = 0; 
        }
        else {
            setTimeout(consoleIfPathChanges, 50);
        }
    }
    else {
        updatecounter2 = 0; 
    }
}

function doWhenDataPointsAreReturned() {
    
    updatecounter += 1;
    
    if (updatecounter < 101) { 
        
        if (poinths.message == "noresponse") {
            
            setTimeout(doWhenDataPointsAreReturned, 50);
        }
        else {
            if (poinths.message == "notnumeric") {
                
                var clthlen = calibrate.thresholds.length;
                calibrate.thresholds = new Array(clthlen);
                
                for (var i = 0; i < clthlen; i++) {
                    ths[i].attr({"text": ""});
                    calibrate.thresholds[i] = ""; 
                }
            }
            else {
                if (poinths.thvals.length > 0) {
                    calibrate.thresholds = new Array(poinths.thvals.length);
                    calibrate.thscopycrp = new Array(poinths.thvals.length);
                    calibrate.thnames = new Array(poinths.thvals.length);
                    for (var i = 0; i < poinths.thvals.length; i++) {
                        ths[i].attr({"text": poinths.thvals[i]});
                        calibrate.thresholds[i] = poinths.thvals[i];
                        calibrate.thscopycrp[i] = poinths.thvals[i];
                    }
                }
                
            }
            
            console_command("calibrate");
            
            drawPointsAndThresholds();
        }
    }
    else {
        updatecounter = 0; 
    }
}

function drawPointsAndThresholds() {
    if (papers["calibrate_main"].crfuz == 0) { 
        calibrate.thsettervar = getTrueKeys(colclicks.calibrate.x);
        
        thsetter_content.remove();
        thsetter_content = papers["calibrate_main"].set().attr({stroke: "#a0a0a0"});
        
        var minv = min(poinths.vals);
        var maxv = max(poinths.vals);
        
        var lm = 160;
        var rm = $("#calibrate").width() - 27; 
        
        var thy = 234;
        
        if (thsetter_jitter.length != poinths.vals.length) {
            thsetter_jitter = new Array(poinths.vals.length);
            for (var i = 0; i < poinths.vals.length; i++) {
                thsetter_jitter[i] = randomBetween(185, 215);
            }
        }
        
        for (var i = 0; i < poinths.vals.length; i++) {
            var point = papers["calibrate_main"].circle(
                (rm - lm)*(poinths.vals[i] - minv)/(maxv - minv) + lm,
                calibrate.jitter?thsetter_jitter[i]:200,
                4);
            point.attr({fill: "#ffffff", "fill-opacity": 0.0});
            point.txt = datainfo.rownames[i];
            point.hover(hoverIn, hoverOut, point, point);
            thsetter_content.push(point);
        }
        
        thsetter_content.push(sat(papers["calibrate_main"].text(lm - 3, thy + 15, minv)));
        thsetter_content.push(sat(papers["calibrate_main"].text(rm + 3, thy + 15, maxv), {"anchor": "end"}));
        
        thsetter_content.push(papers["calibrate_main"].path([ 
            ["M", lm, thy + 5],
            ["L", lm, thy],
            ["L", rm, thy],
            ["L", rm, thy + 5]
        ]));
        
        var position, th;
        var handles = new Array(3);
        
        if (calibrate.thresholds.length > 0) {
            for (i = 0; i < calibrate.thresholds.length; i++) {
                if (calibrate.thresholds[i] != "") {
                    if (calibrate.thresholds[i] < minv) {
                        calibrate.thresholds[i] = minv;
                        ths[i].attr({"text": minv});
                    }
                    else if (calibrate.thresholds[i] > maxv) {
                        calibrate.thresholds[i] = maxv;
                        ths[i].attr({"text": maxv});
                    }
                    position = (rm - lm)*(calibrate.thresholds[i] - minv)/(maxv - minv) + lm;
                    handles[i] = papers["calibrate_main"].path([
                        ["M", position, thy],
                        ["L", position - 5, thy + 7],
                        ["L", position + 5, thy + 7],
                        ["L", position, thy],
                        ["L", position, thy - 66]
                    ]).attr({"stroke-width": 1.5, fill: "#cb2626", stroke: "#cb2626"});
                    handles[i].min = minv;
                    handles[i].max = maxv;
                    handles[i].name = i;
                    handles[i].left = lm;
                    handles[i].right = rm;
                    handles[i].id = "thsetter";
                    handles[i].drag(dragMove(handles[i]), dragStart, dragStop(handles[i]));
                    thsetter_content.push(handles[i]);
                }
            }
        }
        else {
            
        }
        
        var txt, txtfundal;
        function hoverIn() {
                        
            var BBox = this.getBBox();
            var xcoord = BBox.x;
            var ycoord = BBox.y - 20;
            
            txt = sat(papers["calibrate_main"].text(xcoord, ycoord, this.txt), {"anchor": "middle"});
            txt.attr({"font-weight": "bold", "fill-opacity": 0.7});
            var BBox2 = txt.getBBox();
            
            txtfundal = papers["calibrate_main"].rect(xcoord - BBox2.width/2, ycoord - 1, BBox2.width + 10, 16);
            txtfundal.attr({fill: "#c9c9c9", "fill-opacity": 0.6, stroke: "none"});
            txt.toFront();
            txt.translate(5, 7);
            txt.attr({"font-weight": "bold"});
            txt.show();
        }
        
        function hoverOut() {
            txt.remove();
            txtfundal.remove();
        }
    
    }
    
}

function doWhenXYplotPointsAreReturned() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
        if (lastvals.toString() != xyplotdata.toString()) {
            draw_xyplot(papers["xyplot_main"]);
            updatecounter = 0;
        }
        else {
            setTimeout(doWhenXYplotPointsAreReturned, 50);
        }
    }
    else {
        
        $("#result").append("<br><br><span style='color:red'>Error in doWhenXYplotPointsAreReturned:<br> R takes too long to respond.</span><br>");
        $("#result").animate({
            scrollTop: $("#result")[0].scrollHeight
        }, 1000);
        
        updatecounter = 0; 
    }
}

function pingit(where) {
    
    if (where == "loop") { 
    
        pingobj += 1;
        
        Shiny.onInputChange("pingobj", pingobj);
        
        setTimeout(pingit.bind(null, "loop"), 1000*60*4);
        
    }
    else {
        
        if (!pingstarted) {
            
            pingstarted = true;
            
            pingobj += 1;
        
            Shiny.onInputChange("pingobj", pingobj);
            
            setTimeout(pingit.bind(null, "loop"), 1000*60*4);
            
        }
        
    }
}

function printRcommand() {
    pingit();
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
        
        if (outres.result != "listen2R") {
            updatecounter = 0;
            
            var sc = string_command.split("\n");
            $("#tempdiv").remove();
            var header;
            
            for (var i = 0; i < sc.length; i++) {
                
                header = strwrap(sc[i], 74, "  ");
                if (i == 0) {
                    $("#result_main").append("<span style='color:#932192'>" + ((tempcommand == "")?">":"+") + " </span><span style='color:blue'>" + header + "</span><br>");
                }
                else {
                    $("#result_main").append("<span style='color:blue'>&nbsp;&nbsp;" + header + "</span><br>");
                }
            }
            
            tempcommand = "";
            var toprint = "";
            
            if (outres.error != null) {
                toprint = strwrap("Error: " + outres.error + "<br>", 74, "  ");
                $("#result_main").append("<span style='color:red'>" + toprint + "</span><br>");
            } 
            else {
                if (outres.result != null) {
                    if (outres.result.length > 0) {
                        for (var i = 0; i < outres.result.length; i++) {
                            toprint += outres.result[i] + "<br>";
                        }
                        
                        $("#result_main").append(toprint.split(" ").join("&nbsp;") + "<br>");
                    }
                    else {
                        $("#result_main").append("<br>");
                    }
                }
                else {
                    $("#result_main").append("<br>");
                }
                
                if (outres.warning != null) {
                    toprint = strwrap("Warning: " + outres.warning + "<br>", 74, "  ");
                    $("#result_main").append("<span style='color:red'>" + toprint + "</span><br>");
                }
            }
            
            var modified = getKeys(outres.modified);
            
            if (modified.length > 0) {
                if (any(modified, "== \"dataset\"")) {
                    
                    datainfo = outres.modified.dataset.datainfo;
                    theData = outres.modified.dataset.theData;
                    dataCoords = outres.modified.dataset.dataCoords;
                    updateWhenDataChanged();
                }
                
                if (any(modified, "== \"calibcond\"")) {
                    poinths = outres.modified.calibcond;
                    drawPointsAndThresholds();
                }
            }
            
            createCommandPromptInRconsole();
            
            $("#tempdiv").click();
            
            if (outres.plot) {
                plotopen = true;
                
                showDialogToFront(plotsettings);
                
                $("#plotdiv_main").css({
                    "background-image": "url('css/images/plot.svg?" + new Date().getTime() + "')", 
                    "background-size": "100% 100%"
                });
            
                if ($("#saveRplot").length) {
                    $("#preview").css({
                        "background-image": "url('css/images/plot.svg?" + new Date().getTime() + "')", 
                        "background-size": "100% 100%"
                    });
                }
            
            }
            
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
        }
        else {
            setTimeout(printRcommand, 50);
        }
        
    }
    else {
        var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
        history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
        histindex = history.length;
        var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
        
        $("#tempdiv").remove();
        
        $("#result_main").append("<span style='color:#932192'>" + ((tempcommand == "")?">":"+") + " </span><span style='color:blue'>" + header + "</span><br>");
        tempcommand = "";
        
        $("#result_main").append("<br><span style='color:red'>Error: R takes too long to respond.</span><br><br>");
        $("#result_main").animate({
            scrollTop: $("#result_main")[0].scrollHeight
        }, 1000);
        
        createCommandPromptInRconsole();
        $("#tempdiv").click();
        updatecounter = 0;
    }
}

function resizePlot() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
    
        if (outres[0] != "listen2R") {
            
            updatecounter = 0;
            
            $("#plotdiv_main").css({
                "background-image": "url('css/images/plot.svg?" + new Date().getTime() + "')", 
                "background-size": "100% 100%"
            });
        }
        else {
            setTimeout(resizePlot, 100);
        }
        
    }
    else {
        
        updatecounter = 0;
    }
}

function printWhenOutputChanges() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
    
        if (outres[0] != "listen2R") {
            
            updatecounter = 0;
            
            var toprint = outres[0];
            
            if (toprint == "error") {
                toprint = "";
            }
            for (var i = 1; i < outres.length; i++) {
                toprint += "<br>" + outres[i];
            }
            
            var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
            history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            histindex = history.length;
            var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            
            $("#tempdiv").remove();
            $("#result_main").append("<span style='color:#932192'>> </span><span style='color:blue'>" + header + "</span><br>");
            
            if (objname != "") {
                $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
                $("#result_main").append("<span style='color:blue'>" + objname + "</span><br>");
            }
            
            $("#result_main").append(toprint.split(" ").join("&nbsp;") + "<br>");
            
            createCommandPromptInRconsole();
            
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
        }
        else {
            setTimeout(printWhenOutputChanges, 50);
        }
        
    }
    else {
        
        $("#result_main").append("<br><span style='color:red'>Error in printWhenOutputChanges:<br>R takes too long to respond.</span><br>");
        $("#result_main").animate({
            scrollTop: $("#result_main")[0].scrollHeight
        }, 1000);
        
        createCommandPromptInRconsole();
        
        updatecounter = 0;
    }
}

function doWhenRresponds() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
    
        if (outres[0] != "listen2R") {
            
            var noerror = true;
            
            var toprint = outres[0][0];
            if (toprint == "no problem") {
                toprint = "";
            }
            else if (toprint == "error") {
                toprint = "";
                noerror = false;
                for (var i = 1; i < outres[0].length; i++) {
                    toprint += "<br>" + outres[0][i];
                }
            } 
            
            var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
            history[(histindex < history.length)?history.length:histindex] = string_command.replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            histindex = history.length;
            var header = strwrap(string_command, 74, "  ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            
            $("#tempdiv").remove();
            $("#result_main").append("<span style='color:#932192'>> </span><span style='color:blue'>" + header + "</span><br><br>");
            
            if (toprint != "") {
                $("#result_main").append(toprint.split(" ").join("&nbsp;") + "<br>");
            }
            
            createCommandPromptInRconsole();
            
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            updatecounter = 0;
            
            if (noerror) {
                datainfo.colnames = outres[1].colnames;
                datainfo.rownames = outres[1].rownames;
                datainfo.ncols = outres[1].ncols;
                datainfo.nrows = outres[1].nrows;
                datainfo.numerics = outres[1].numerics;
                
                visibledata = theData.toString();
                theData = outres[2][0];
                
                coordscopy = dataCoords;
                
                dataCoords = outres[2][1];
                
                if (theData.toString() != visibledata | dataCoords != coordscopy) {
                    
                    refresh_cols("all");
                    
                    if ($("#data_editor").length) {
                        
                        $(papers["data_body"].canvas).width(70*datainfo.ncols + 5);
                        $(papers["data_body"].canvas).height(20*datainfo.nrows + 5);
                        $(papers["data_rownames"].canvas).height(20*datainfo.nrows + 25);
                        $(papers["data_colnames"].canvas).width(70*datainfo.ncols + 25);
                        
                        update_data();
                    } 
                }
                
            }
            
        }
        else {
            
            setTimeout(doWhenRresponds, 50);
        }
    }
    else {
        
        $("#result_main").append("<br><br><span style='color:red'>Error in doWhenRresponds:<br>R takes too long to respond.</span><br>");
        $("#result_main").animate({
            scrollTop: $("#result_main")[0].scrollHeight
        }, 1000);
        
        updatecounter = 0;
    }
}

function print_dirs() {
    
    if ($("#import").length) {
        
        if (dirfile.filename == "error!") {
            papers["import_main"].glow.show();
        }
        else {
            papers["import_main"].glow.hide();
            
            papers["import_main"].stdir_text.attr({"text": ""});
            
            papers["impath"].goToDir = function(dir) {
                dirfile_chosen[0] = "dir";
                dirfile_chosen[1] = dir;
                dirfile_chosen[2] = "";
                
                pathcopy = dirfile.filepath;
                Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                printDirsWhenPathChanges();
            }
            
            setPath(papers["impath"], dirfile.wd);
            
            var rw = 400; 
            papers["importdirs"].clear();
            
            var i, aaa, bbb, ccc, toprint, printplus;
            var row = 10;
            var fill_opacity = 0.3;
            var rects_back = papers["importdirs"].set();
            var texts = papers["importdirs"].set();
            var rects = papers["importdirs"].set();
            var pluses = papers["importdirs"].set();
            var x = 30; 
            var dirs_length = 1*((dirfile.dirs === null)?0:dirfile.dirs.length);
            var files_length = 1*((dirfile.files === null)?0:dirfile.files.length);
            var clicked = -1;
        
            for (i = 0; i < (1 + dirs_length + files_length); i++) {
                
                printplus = false;
                
                bbb = papers["importdirs"].rect(0, row - 10, rw, 20);
                bbb.id = i;
                rects_back.push(bbb);
                
                if (i == 0) {
                    toprint = "..";
                    pluses.push(papers["importdirs"].text(0, 0, ""));
                }
                else {
                    if (i < (dirs_length + 1)) {
                        printplus = true;
                        toprint = dirfile.dirs[i - 1];
                    }
                    else {
                        toprint = dirfile.files[i - dirs_length - 1];
                    }
                }
                
                if (printplus) {
                    pluses.push(sat(papers["importdirs"].text(x - 20, row, "+")));
                }
                
                aaa = sat(papers["importdirs"].text(x, row, toprint));
                texts.push(aaa);
                
                ccc = papers["importdirs"].rect(0, row - 10, rw, 20);
                ccc.id = i;
                ccc.txt = (i == 0)?(".."):(toprint);
                
                ccc.click(function() {
                        pluses.forEach(function(e) {
                            e.attr({fill: "#000000"});
                        });
                        
                        if (clicked >= 0 && clicked != this.id) {
                            rects_back[clicked].attr({fill: "#e6f2da", "stroke-opacity": 0, "fill-opacity": 1 - 1*(clicked % 2 === 0)});
                            texts[clicked].attr({fill: "#000000"});
                        }
                        
                        clicked = this.id;
                        
                        rects_back[this.id].attr({fill: "#79a74c", "stroke-opacity": 0, "fill-opacity": 1});
                        texts[this.id].attr({fill: "#ffffff"});
                        
                        if (this.id < (dirs_length + 1)) {
                            pluses[this.id].attr({fill: "#ffffff"});
                        }
                        
                        dirfile_chosen[0] = (this.id < (dirs_length + 1))?"dir":"file";
                        dirfile_chosen[1] = (this.txt == "..")?((dirfile_chosen[1] == "..")?"...":".."):this.txt;
                        
                        if (dirfile_chosen[0] == "file") {
                            
                            read_table.counter += 1;
                            Shiny.onInputChange("read_table", read_table);
                            
                            visiblerows = 16;
                            visiblecols = 7;
                            scrollvh = [0, 0, visiblerows, visiblecols];
                            papers["importcols"].clear();
                            $(papers["importcols"].canvas).width(100);
                            papers["importcols"].text(10, 11, "Loading...").attr({"text-anchor": "start", "font-size": "14px"});
                            
                            tempdatainfo.nrows = 0;
                            updatecounter = 0;
                            checkIfDataLoadedInR();
                            
                            pathcopy = dirfile.filepath;
                            updatecounter2 = 0;
                            Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                            consoleIfPathChanges();
                            
                        }
                        
                    })
                    .dblclick(function(event) {
                        
                        dirfile_chosen[0] = (this.id < (dirs_length + 1))?"dir":"file";
                        dirfile_chosen[1] = (this.txt == "..")?((dirfile_chosen[1] == "..")?"...":".."):this.txt;
                        dirfile_chosen[2] = "";
                        
                        papers["import_main"].stdir_text.attr({"text": ""});
                        
                        if (dirfile_chosen[0] == "dir") {
                            
                            pathcopy = dirfile.filepath;
                            
                            Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                            printDirsWhenPathChanges();
                            
                        }
                        
                    });
                    
                rects.push(ccc);
                
                row += 20;
            }
            
            rects_back.forEach(function(e) {
                e.attr({fill: (e.id % 2 === 0)?"#ffffff":"#e6f2da", "stroke-opacity": 0, "fill-opacity": 1});
            });
            
            rects.forEach(function(e) {
                e.attr({fill: "#ffffff", "stroke-opacity": 0, "fill-opacity": 0});
            });
            
            rects_back.toBack();
            rects.toFront();
            
            canvas_height = Math.max(400, rects.getBBox().height);
            
            $(papers["importdirs"].canvas).height(canvas_height);
            $("#importdirs").css({height: canvas_height});
            if (dirfile_chosen[0] == "dir") {
                $("#importdirs").scrollTop(0);
            }
        
        }
        
    }
    
    if ($("#export").length) {
        
        papers["expath"].goToDir = function(dir) {
            dirfile_chosen[0] = "dir";
            dirfile_chosen[1] = dir;
            pathcopy = dirfile.filepath;
            Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
            printDirsWhenPathChanges();
        }
        
        setPath(papers["expath"], dirfile.wd);
        
        var rw = 400; 
        papers["exportdirs"].clear();
        
        var i, aaa, bbb, ccc, extoprint, printplus;
        var row = 10;
        var fill_opacity = 0.3;
        var exrects_back = papers["exportdirs"].set();
        var extexts = papers["exportdirs"].set();
        var exrects = papers["exportdirs"].set();
        var expluses = papers["exportdirs"].set();
        var x = 30; 
        var exdirs_length = 1*((dirfile.dirs === null)?0:dirfile.dirs.length);
        var exfiles_length = 1*((dirfile.files === null)?0:dirfile.files.length);
        var exclicked = -1;
        
        papers["export_main"].ovr.hideIt();
        if (dirfile.files != void 0) {
            if (dirfile.files.indexOf(exportobj.filename) >= 0) {
                papers["export_main"].ovr.showIt();
            }
        }
        
        console_command("export");
        
        for (i = 0; i < (1 + exdirs_length + exfiles_length); i++) {
            
            printplus = false;
            
            bbb = papers["exportdirs"].rect(0, row - 10, rw, 20);
            bbb.id = i;
            exrects_back.push(bbb);
            
            if (i == 0) {
                extoprint = "..";
                expluses.push(papers["exportdirs"].text(0, 0, ""));
            }
            else {
                if (i < (exdirs_length + 1)) {
                    printplus = true;
                    extoprint = dirfile.dirs[i - 1];
                }
                else {
                    extoprint = dirfile.files[i - exdirs_length - 1];
                }
            }
            
            if (printplus) {
                expluses.push(papers["exportdirs"].text(x - 20, row, "+").attr({"text-anchor": "start", "font-size": "14px"}));
            }
            
            aaa = sat(papers["exportdirs"].text(x, row, extoprint));
            extexts.push(aaa);
            
            ccc = papers["exportdirs"].rect(0, row - 10, rw, 20);
            ccc.id = i;
            ccc.txt = (i == 0)?(".."):(extoprint);
            
            ccc.click(function() {
                    expluses.forEach(function(e) {
                        e.attr({fill: "#000000"});
                    });
                    
                    if (exclicked >= 0 && exclicked != this.id) {
                        exrects_back[exclicked].attr({fill: "#e6f2da", "stroke-opacity": 0, "fill-opacity": 1*(exclicked % 2 === 0)});
                        extexts[exclicked].attr({fill: "#000000"});
                    }
                    
                    exclicked = this.id;
                    
                    exrects_back[this.id].attr({fill: "#79a74c", "stroke-opacity": 0, "fill-opacity": 1});
                    extexts[this.id].attr({fill: "#ffffff"});
                    
                    if (this.id < (exdirs_length + 1)) {
                        expluses[this.id].attr({fill: "#ffffff"});
                    }
                    
                    if (this.id > exdirs_length) { 
                        papers["export_main"].newname.attr({"text": this.txt});
                        exportobj.filename = this.txt;
                        papers["export_main"].ovr.showIt();
                    }
                    
                })
                .dblclick(function() {
                    
                    dirfile_chosen[0] = (this.id < (exdirs_length + 1))?"dir":"file";
                    dirfile_chosen[1] = (this.txt == "..")?((dirfile_chosen[1] == "..")?"...":".."):this.txt;
                    
                    if (dirfile_chosen[0] == "dir") {
                        
                        pathcopy = dirfile.filepath;
                        Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                        consoleIfPathChanges();
                        printDirsWhenPathChanges();
                        
                    }
                    
                });
                
            exrects.push(ccc);
            
            row += 20;
        }
        
        exrects_back.forEach(function(e) {
            e.attr({fill: (e.id % 2 === 0)?"#e6f2da":"#ffffff", "stroke-opacity": 0, "fill-opacity": 1});
        });
        
        exrects.forEach(function(e) {
            e.attr({fill: "#ffffff", "stroke-opacity": 0, "fill-opacity": 0});
        });
        
        exrects_back.toBack();
        exrects.toFront();
        
        canvas_height = Math.max(400, exrects.getBBox().height);
        
        $(papers["exportdirs"].canvas).height(canvas_height);
        $("#exportdirs").css({height: canvas_height});
        
            $("#exportdirs").scrollTop(0);
        
    }
    
    if ($("#saveRplot").length) {
        
        papers["savepath"].goToDir = function(dir) {
            dirfile_chosen[0] = "dir";
            dirfile_chosen[1] = dir;
            pathcopy = dirfile.filepath;
            Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
            printDirsWhenPathChanges();
        }
        
        setPath(papers["savepath"], dirfile.wd);
        
        var rw = 400; 
        
        papers["savedirs"].clear();
        
        if (savetexts !== void 0) {
            savetexts.remove();
        }
        
        var aaa, bbb, ccc, svtoprint, printplus;
        var row = 10;
        var fill_opacity = 0.3;
        var saverects_back = papers["savedirs"].set();
        var savetexts = papers["savedirs"].set();
        var saverects = papers["savedirs"].set();
        var savepluses = papers["savedirs"].set();
        var x = 30; 
        var savedirs_length = 1*((dirfile.dirs === null)?0:dirfile.dirs.length);
        var savefiles_length = 1*((dirfile.files === null)?0:dirfile.files.length);
        var svclicked = -1;
        
        papers["saveRplot_main"].ovr.hideIt();
        if (dirfile.files != void 0) {
            if (dirfile.files.indexOf(exportobj.filename) >= 0) {
                papers["saveRplot_main"].ovr.showIt();
            }
        }
        
        console_command("saveRplot_main");
        
        for (var i = 0; i < (1 + savedirs_length + savefiles_length); i++) {
            
            printplus = false;
            
            bbb = papers["savedirs"].rect(0, row - 10, rw, 20);
            bbb.id = i;
            saverects_back.push(bbb);
            
            if (i == 0) {
                svtoprint = "..";
                savepluses.push(papers["savedirs"].text(0, 0, ""));
            }
            else {
                if (i < (savedirs_length + 1)) {
                    printplus = true;
                    svtoprint = dirfile.dirs[i - 1];
                }
                else {
                    svtoprint = dirfile.files[i - savedirs_length - 1];
                }
            }
            
            if (printplus) {
                savepluses.push(papers["savedirs"].text(x - 20, row, "+").attr({"text-anchor": "start", "font-size": "14px"}));
            }
            
            aaa = sat(papers["savedirs"].text(x, row, svtoprint));
            
            savetexts.push(aaa);
            
            ccc = papers["savedirs"].rect(0, row - 10, rw, 20);
            ccc.id = i;
            ccc.txt = (i == 0)?(".."):(svtoprint);
            
            ccc.click(function() {
                    savepluses.forEach(function(e) {
                        e.attr({fill: "#000000"});
                    });
                    
                    if (svclicked >= 0 && svclicked != this.id) {
                        saverects_back[svclicked].attr({fill: "#e6f2da", "stroke-opacity": 0, "fill-opacity": 1*(svclicked % 2 === 0)});
                        savetexts[svclicked].attr({fill: "#000000"});
                    }
                    
                    svclicked = this.id;
                    
                    saverects_back[this.id].attr({fill: "#79a74c", "stroke-opacity": 0, "fill-opacity": 1});
                    savetexts[this.id].attr({fill: "#ffffff"});
                    
                    if (this.id < (savedirs_length + 1)) {
                        savepluses[this.id].attr({fill: "#ffffff"});
                    }
                    
                    if (this.id > savedirs_length) { 
                        papers["saveRplot_main"].filename.attr({"text": this.txt});
                        saveRplot.filename = this.txt;
                        papers["saveRplot_main"].ovr.showIt();
                    }
                    
                })
                .dblclick(function() {
                    
                    dirfile_chosen[0] = (this.id < (savedirs_length + 1))?"dir":"file";
                    dirfile_chosen[1] = (this.txt == "..")?((dirfile_chosen[1] == "..")?"...":".."):this.txt;
                    
                    if (dirfile_chosen[0] == "dir") {
                        
                        pathcopy = dirfile.filepath;
                        Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
                        consoleIfPathChanges();
                        printDirsWhenPathChanges();
                        
                    }
                    
                });
                
            saverects.push(ccc);
            
            row += 20;
        }
        
        saverects_back.forEach(function(e) {
            e.attr({fill: (e.id % 2 === 0)?"#e6f2da":"#ffffff", "stroke-opacity": 0, "fill-opacity": 1});
        });
        
        saverects.forEach(function(e) {
            e.attr({fill: "#ffffff", "stroke-opacity": 0, "fill-opacity": 0});
        });
        
        saverects_back.toBack();
        saverects.toFront();
        
        canvas_height = Math.max(400, saverects.getBBox().height);
        
        $(papers["savedirs"].canvas).height(canvas_height);
        $("#savedirs").css({height: canvas_height});
        
            $("#savedirs").scrollTop(0);
        
    }
}

function updateWhenDataChanged() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) { 
        if (theData.toString() != visibledata | dataCoords != coordscopy) {
            update_data();
            updatecounter = 0; 
        }
        else {
            
            setTimeout(updateWhenDataChanged, 50);
        }
    }
    else {
        updatecounter = 0; 
    }
}

function printIfDirsFilesChange() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
        
        var test = "";
        
        if (dirfile.dirs != null) {
            test += dirfile.dirs.toString();
        }
        
        if (dirfile.files != null) {
            test += dirfile.files.toString();
        }
        
        if (test != dirsfilescopy) {
            
            print_dirs();
            updatecounter = 0;
        }
        else {
            setTimeout(printIfDirsFilesChange, 50);
        }
    }
    else {
        updatecounter = 0;
    }
}

function printDirsWhenPathChanges() {
    
    updatecounter += 1;
    
    if (updatecounter < 21) {
        
        if (dirfile.filepath != pathcopy) {
            print_dirs();
        }
        else {
            setTimeout(printDirsWhenPathChanges, 50);
        }
    }
    else {
        updatecounter = 0;
    }
}

var lastX, absoluteX, newpos;

function dragStart() {
    lastX = 0;
    var getBB = this.getBBox()
    absoluteX = getBB.x + getBB.width/2;
};

function dragMove(slider) {
    
    return function(dx, dy) {
        var newX = dx - lastX;
        
        if (absoluteX + dx > slider.right) {
            newX = this.right - absoluteX - lastX;
        }
        
        if (absoluteX + dx < slider.left) {
            newX = this.left - absoluteX - lastX;
        }
        
        this.translate(newX, 0);
        
        if (absoluteX + dx < this.left) {
            lastX = this.left - absoluteX;
        }
        else {
            lastX += newX;
        }
        
        newpos = (absoluteX + lastX - this.left)/(this.right - this.left);
        newpos = this.min + newpos*(this.max - this.min);
        
        if (this.id == "thsetter") {
            newpos = Math.round(newpos*1000)/1000;
            ths[this.name].attr({"text": newpos});
            calibrate.thresholds[this.name] = newpos;
        }
        else if (this.id == "xyplot") {
            papers["xyplot_main"].labelRotation = newpos;
            if (xyplotdata.length > 0) {
                createLabels(papers["xyplot_main"]);
            }
        }
        
    }
};

function dragStop(slider) {
    return function() {
        if (this.id == "thsetter") {
            console_command("calibrate");
        }
        else if (this.id == "xyplot") {
            papers["xyplot_main"].labelRotation = newpos;
        }
    }
};

var lastY, absoluteY;

function dragSortStart(sortoption) {
    return function() {
        lastY = 0;
        var getBB = sortoption[2].getBBox();
        absoluteY = getBB.y + getBB.height/2;
        sortoption.toFront();
    }
};

function dragSortMove(sortoption) {
    
    return function(dx, dy) {
        var newY = dy - lastY;
        
        if (absoluteY + dy > sortoption[2].bottom) {
            newY = sortoption[2].bottom - absoluteY - lastY;
        }
        
        if (absoluteY + dy < sortoption[2].top) {
            newY = sortoption[2].top - absoluteY - lastY;
        }
        
        sortoption.translate(0, newY);
        
        if (absoluteY + dy < sortoption[2].top) {
            lastY = sortoption[2].top - absoluteY;
        }
        else {
            lastY += newY;
        }
    }
};

function dragSortStop(sortoption) {
    
    return function() {
        
        var newBB = sortoption[2].getBBox();
        var middle = newBB.y + newBB.height/2;
        var oldposition, newposition, decid;
        
        for (var i = 0; i < 3; i++) {
            
            if (absoluteY > papers["tt_main"].coordsy[i]) {
                oldposition = i;
            }
            
            if (middle > papers["tt_main"].coordsy[i]) {
                newposition = i;
            }
            
        }
        
        if (oldposition == newposition) {
            
            if (tt.sort_sel[sortoption[2].name]) {
                sortoption[0].attr({fill: "#eeeeee", stroke: "none"});
                sortoption[1].attr({fill: "black", "text-anchor": "start", "font-size": "14px"});
                
            }
            else {
                sortoption[0].attr({fill: "#79a74c", stroke: "none"});
                sortoption[1].attr({fill: "white", "text-anchor": "start", "font-size": "14px"});
                
            }
            
            tt.sort_sel[sortoption[2].name] = !tt.sort_sel[sortoption[2].name];
            sortoption[0].backcolor = tt.sort_sel[sortoption[2].name];
            
            sortoption.translate(0, papers["tt_main"].coordsy[oldposition] - newBB.y);
            
        }
        else {
            var positions = copyArray(papers["tt_main"].positions);
            var distomove;
            
            distomove = papers["tt_main"].coordsy[oldposition] - papers["tt_main"].sortsets[positions[newposition]].getBBox().y;
            papers["tt_main"].sortsets[positions[newposition]].translate(0, distomove);
            sortoption.translate(0, papers["tt_main"].coordsy[newposition] - newBB.y);
            
            papers["tt_main"].positions[oldposition] = positions[newposition];
            papers["tt_main"].positions[newposition] = positions[oldposition];
            
            if (Math.abs(newposition - oldposition) == 2) {
                distomove = papers["tt_main"].coordsy[oldposition] - papers["tt_main"].sortsets[positions[1]].getBBox().y;
                papers["tt_main"].sortsets[positions[1]].translate(0, distomove);
                
                distomove = papers["tt_main"].coordsy[1] - papers["tt_main"].sortsets[positions[newposition]].getBBox().y;
                papers["tt_main"].sortsets[positions[newposition]].translate(0, distomove);
                
                papers["tt_main"].positions[oldposition] = positions[1];
                papers["tt_main"].positions[1] = positions[newposition];
            }
            
            tt.sort_by = reorder(tt.sort_by, oldposition, newposition);
            tt.sort_sel = reorder(tt.sort_sel, oldposition, newposition);
        }
        
        var keys = getKeys(tt.sort_by);
        for (var i = 0; i < 3; i++) {
            papers["tt_main"].decrease[i].cover.name = keys[i];
            
            if (tt.sort_by[keys[i]]) {
                papers["tt_main"].decrease[i].check();
            }
            else {
                papers["tt_main"].decrease[i].uncheck();
            }
            
            if (tt.sort_sel[keys[i]]) {
                papers["tt_main"].decrease[i].showIt();
            }
            else {
                papers["tt_main"].decrease[i].hideIt();
            }
        }
        
        if (getTrueKeys(tt.sort_sel).length == 0) {
            papers["tt_main"].decr.hide();
        }
        else {
            papers["tt_main"].decr.show();
        }
        
        console_command("tt");
            
    }
}

function makePapers(obj) {
    papers[obj.name + "_main"] = Raphael(obj.name + "_main", obj.width, obj.height);
    
    if (obj.inside != undefined) {
        var keys = getKeys(obj.inside);
        for (var i = 0; i < keys.length; i++) {
            papers[keys[i]] = Raphael(keys[i], obj.inside[keys[i]].width, obj.inside[keys[i]].height);
        }
    }
}

$("#menu_import").click(function() {
    
    pingit();
    
    var settings = {
        name:       "import",
        title:      "Import from text file",
        position:   {my: "left top", at: "left+5px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      680,
        height:     433,
        inside: {
            
            impath:     {border: true, left: 270, top:  62, width: 400, height:  40},
            importdirs: {border: true, left: 264, top:  80, width: 400, height: 300},
            importcols: {border: true, left:  14, top: 260, width: 235, height: 120}
        }
    };
    
    if ($("#import").length) {
        showDialogToFront(settings);
    }
    else {
        current_command = "import";
        createDialog(settings);
        makePapers(settings);
        $(papers["importcols"].canvas).height(20);
        draw_import(papers["import_main"]);
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_export").click(function() {
    
    pingit();
    
    var settings = {
        name:       "export",
        title:      "Export to text file",
        position:   {my: "left top", at: "left+5px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      655,
        height:     375,
        inside: {
            
            expath:     {border: true, left: 240, top:  60, width: 400, height:  40},
            exportdirs: {border: true, left: 240, top:  78, width: 400, height: 240}
        }
    };
    
    if ($("#export").length) {
        showDialogToFront(settings);
    }
    else {
        current_command = "export";
        createDialog(settings);
        makePapers(settings);
        draw_export(papers["export_main"]);
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_edit").click(function() {
    
    pingit();
    
    var vscrollbar = datainfo.nrows > visiblerows;
    var hscrollbar = datainfo.ncols > visiblecols;
    var settings = {
        name:       "data_editor",
        title:      "Data editor",
        position:   {my: "left top", at: "left+" + testX + "px top+" + testY + "px", of: window, collision: "flip"},
        resizable:  true,
        width:      200, 
        height:     150, 
        inside: {
            data_topleft:  {
                border: false,
                left:  0,
                top: 20,
                width: 70,
                height: 20
            },
            data_colnames: {
                border: false,
                left: 70,
                top: 20,
                width: (visiblecols + 1)*70,
                height: 20
            },
            data_rownames: {
                border: false,
                left:  0,
                top: 40,
                width: 70,
                height: (visiblerows + 1)*20
            },
            data_body: {
                border: false,
                left: 70,
                top: 40,
                width: (visiblecols + 1)*70 + 1*(vscrollbar?scrollbarsWH:0),
                height: (visiblerows + 1)*20 + 1*(hscrollbar?scrollbarsWH:0)
            }
        }
    };
    
    if ($("#data_editor").length) {
        showDialogToFront(settings);
        update_data(); 
    }
    else {
        
        createDialog(settings);
        makePapers(settings);
        
        $("#data_editor").width((visiblecols + 1 + 1)*70 + 1*(vscrollbar?scrollbarsWH:0));
                                            
        $("#data_editor").height((visiblerows + 1 + 2)*20 + 1*(hscrollbar?scrollbarsWH:0));
        
        $("#data_editor").draggable({
            drag: function(ev, ui) {
                testX = ui.position.left;
                testY = ui.position.top;
            }
        });
        
        print_data(); 
        
        $("#data_editor_main").width($("#data_editor").width());
        $("#data_editor_main").height($("#data_editor").height() - 20);
        
        $("#data_editor").resizable({
            start: function(event, ui) {
                
            },
            resize: function(event, ui) {
                
                $("#data_editor_main").width($("#data_editor").width());
                $("#data_editor_main").height($("#data_editor").height() - 20);
                
                $("#data_body").width($("#data_editor").width() - 70);
                $("#data_body").height($("#data_editor").height() - 40);
                $("#data_colnames").width($("#data_editor").width() - 70 - 1*((datainfo.nrows > visiblerows)?scrollbarsWH:0));
                $("#data_rownames").height($("#data_editor").height() - 40 - 1*((datainfo.ncols > visiblecols)?scrollbarsWH:0));
                
                visiblerows = Math.round($("#data_rownames").height()/20);
                visiblecols = Math.round($("#data_colnames").width() /70); 
            },
            stop: function(event, ui) {
                var vscrollbar = datainfo.nrows > visiblerows;
                var hscrollbar = datainfo.ncols > visiblecols;
                var scrollvh2 = scrollvh.slice(); 
                
                $("#data_editor").width( (visiblecols + 1)*70 + 1*(vscrollbar?scrollbarsWH:0));
                $("#data_editor").height((visiblerows + 2)*20 + 1*(hscrollbar?scrollbarsWH:0));
                $("#data_editor_main").width($("#data_editor").width());
                $("#data_editor_main").height($("#data_editor").height() - 20);
                
                $("#data_body").width($("#data_editor").width() - 70);
                $("#data_body").height($("#data_editor").height() - 40);
                
                $("#data_colnames").width(visiblecols*70);
                $("#data_rownames").height(visiblerows*20);
                
                scrollvh[2] = scrollvh[0] + (visiblerows - 1);
                scrollvh[3] = scrollvh[1] + (visiblecols - 1);
                
                if (!arraysEqual(scrollvh, scrollvh2)) {
                    
                    visibledata = theData.toString();
                    coordscopy = dataCoords;
                    Shiny.onInputChange("scrollvh", scrollvh);
                    updatecounter = 0;
                    updateWhenDataChanged();
                }
                
            }
        });
        
        $("#data_body").scroll(function () {
            $("#data_rownames").scrollTop($("#data_body").scrollTop());
            $("#data_colnames").scrollLeft($("#data_body").scrollLeft());
            
            clearTimeout($.data(this, 'scrollCheck'));
            
            $.data(this, "scrollCheck", setTimeout(function() {
                var vertical = $("#data_body").scrollTop();
                var horizontal = $("#data_body").scrollLeft(); 
                
                var cellstoright = Math.round(horizontal/70);
                var cellsdown = Math.round(vertical/20);
                
                var change = false;
                
                if (cellstoright != scrollvh[1]) {
                    change = true;
                    scrollvh[1] = cellstoright;
                    scrollvh[3] = Math.min(visiblecols, datainfo.ncols - scrollvh[1]);
                }
                
                if (cellsdown != scrollvh[0]) {
                    change = true;
                    scrollvh[0] = cellsdown;
                    scrollvh[2] = Math.min(visiblerows, datainfo.nrows - scrollvh[0]);
                }
                
                if (change) {
                    
                    visibledata = theData.toString();
                    coordscopy = dataCoords;
                    Shiny.onInputChange("scrollvh", scrollvh);
                    
                    updateWhenDataChanged();
                }
                
            }, 100));
        });
        
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_calibrate").click(function() {
    
    pingit();
    
    var settings = {
        name:      "calibrate",
        title:     "Calibrate",
        position:  {my: "left top", at: "left+80px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     490,
        height:    335,
        inside: {
            "calibcols": {border: true, left: 15, top: 57, width: 120, height: 220}
        }
    };
    
    if ($("#calibrate").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        makePapers(settings);
        thsetter_content = papers["calibrate_main"].set();
        refresh_cols("calibrate");
        draw_calib(papers["calibrate_main"]);
    }
    
    $("#calibrate").resizable({
        start: function() {
            showDialogToFront(settings);
        },
        resize: function() {
            $(this).height(settings.height);
            $("#calibrate_main").width($("#calibrate").width());
            $(papers["calibrate_main"].canvas).width($("#calibrate").width());
            
            papers["calibrate_main"].thsetter_frame.attr({width: $("#calibrate").width() - 170});
            papers["calibrate_main"].Run.transform("t" + ($("#calibrate").width() - 490) + ",0");
        },
        stop: function () {
            if (poinths.vals.length > 0) {
                drawPointsAndThresholds();
            }
        }
    });
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_recode").click(function() {
    
    pingit();
    
    var settings = {
        name:      "recode",
        title:     "Recode",
        position:  {my: "left top", at: "left+80px top+33px", of: window, collision: "flip"},
        resizable: false,
        width:     520,
        height:    310,
        inside: {
            recodecols: {border: true, left: 14, top:  57, width: 120, height: 200},
            recrules:   {border: true, left: 335, top: 157, width: 170, height: 100}
        }
    };
    
    if ($("#recode").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        makePapers(settings);
        refresh_cols("recode");
        draw_recode(papers["recode_main"]);
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;

});

$("#menu_tt").click(function() {
    
    pingit();
    
    var settings = {
        name:      "tt",
        title:     "Truth table",
        position:  {my: "left top", at: "left+170px top+33px", of: window, collision: "flip"},
        resizable: false,
        width:     460,
        height:    340,
        inside: {
            ttcols1: {border: true, left:  13, top:  50, width: 212, height: 120},
            ttcols2: {border: true, left: 234, top:  50, width: 212, height: 120}
        }
    };
    
    if ($("#tt").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        makePapers(settings);
        refresh_cols("tt");
        draw_tt(papers["tt_main"]);
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_eqmcc").click(function() {
    
    pingit();
    
    var settings = {
        name:       "eqmcc",
        title:      "Quine-McCluskey minimization",
        position:   {my: "left top", at: "left+170px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      463,
        height:     432,
        inside: {
            eqcols1: {border: true, left:  14, top:  47, width: 212, height: 120},
            eqcols2: {border: true, left: 235, top:  47, width: 212, height: 120},
            direxp:  {border: true, left:  14, top: 312, width: 120, height: 102}
        }
    };
    
    if ($("#eqmcc").length) {
        showDialogToFront(settings);
    }
    else {
    
        createDialog(settings);
        makePapers(settings);
        draw_eqmcc(papers["eqmcc_main"]);
        refresh_cols("eqmcc");
        filldirexp();
        current_command = "eqmcc";
        
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_xyplot").click(function() {
    
    pingit();
    
    var settings = {
        name:      "xyplot",
        title:     "XY plot",
        position:  {my: "left top", at: "left+240px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     720,
        height:    567,
        inside: {
            xyplotcols1: {border: true, left: 13, top:  210, width: 150, height: 120},
            xyplotcols2: {border: true, left: 13, top:   54, width: 150, height: 120}
            
        }
    };
    
    if ($("#xyplot").length) {
        showDialogToFront(settings);
    }
    else {
        
        createDialog(settings);
        makePapers(settings);
        refresh_cols("xyplot");
        draw_xyplot(papers["xyplot_main"])
    }
    
    $("#xyplot").resizable({
        resize: function () {
            var paper = papers["xyplot_main"];
            $("#xyplot").width($("#xyplot_main").height() + 173);
            $(paper.canvas).width($("#xyplot").width());
            $(paper.canvas).height($("#xyplot").height() - 20);
            $("#xyplot_main").width($("#xyplot").width());
            $("#xyplot_main").height($("#xyplot").height() - 20);
        },
        stop: function() {
            var paper = papers["xyplot_main"];
            $(paper.canvas).width($("#xyplot").width() - 50);
            $(paper.canvas).height($("#xyplot").height() - 70);
            $(paper.canvas).width($("#xyplot").width());
            $(paper.canvas).height($("#xyplot").height() - 20);
            paper.scale = Math.min(($(paper.canvas).width() - paper.sx - 10)/paper.dim, ($(paper.canvas).height() - paper.sy - 47)/paper.dim);
            
            draw_xyplot(paper);
        }
    });
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_venn").click(function() {
    
    pingit();
    
    var settings = {
        name:      "venn",
        title:     "Venn diagram",
        position:  {my: "left top", at: "left+240px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     430, 
        height:    500
    };
    
    if ($("#venn").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        makePapers(settings);
    }
    
    draw_venn(papers["venn_main"]);
    
    $("#venn").resizable({
        stop: function() {
            var paper = papers["venn_main"];
            $(paper.canvas).width($("#venn").width() - 50);
            $(paper.canvas).height($("#venn").height() - 70);
            $(paper.canvas).width($("#venn").width());
            $(paper.canvas).height($("#venn").height() - 20);
            paper.scale = (Math.min($(paper.canvas).width() - 20, $(paper.canvas).height() - 70))/1000;
            
            draw_venn(paper);
            paper.hover = true;
        }
    });
    
    $("#venn").resize(function() {
        var paper = papers["venn_main"];
        paper.hover = false;
        $("#venn").height($("#venn").width() + 70);
        $("#venn_main").width($("#venn").width());
        $("#venn_main").height($("#venn").height() - 20);
        
        $(paper.canvas).width($("#venn").width());
        $(paper.canvas).height($("#venn").height() - 20);
    });
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_saveRplot").click(function() {
    
    pingit();
    
    var settings = {
        name:       "saveRplot",
        title:      "Save R plot window",
        position:   {my: "left top", at: "left+5px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      655,
        height:     400,
        inside: {
            
            preview: {border: false, left: 10, top:  30, width: 220, height: 200},
            savepath: {border: false, left: 240, top:  60, width: 400, height:  40},
            savedirs: {border: true, left: 240, top:  78, width: 400, height: 260}
        }
    };
    
    if ($("#saveRplot").length) {
        showDialogToFront(settings);
    }
    else {
        current_command = "saveRplot";
        createDialog(settings);
        makePapers(settings);
        draw_saveRplot(papers["saveRplot_main"]);
    }
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});

$("#menu_about").click(function() {
    
    pingit();
    
    var settings = {
        name:       "about",
        title:      "About this software",
        position:   {my: "left top", at: "left+300px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      470,
        height:     405 + 10*(navigator.browserType == "Firefox")
    };
    
    if ($("#about").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        var messages = [
            "R package: QCAGUI, version 2.3",
            "",
            "Author: Adrian Dușa (dusa.adrian@unibuc.ro)",
            "",
            "Contributors:",
            "            jQuery Foundation  (jQuery library and jQuery UI library)",
            "            jQuery contributors (jQuery library and jQuery UI library)",
            "            Vasil Dinkov (smartmenus.js library)",
            "            Dmitry Baranovskiy (raphael.js library)",
            "            Thomas Richter (raphael.boolean.js library)",
            "            Emmanuel Quentin (raphael.inline_text_editing.js library)",
            "            Jimmy Breck-McKye (raphael-paragraph.js library)",
            "            Alrik Thiem (package QCA versions 1.0-0 to 1.1-3)",
            "",
            "The package QCAGUI continues the development of the QCA package,",
            "and complements it with a reactive graphical user interface.",
            "It has an extensive set of functions to perform Qualitative Comparative",
            "Analysis: crisp sets (csQCA), temporal (tQCA), multi-value (mvQCA) and",
            "fuzzy sets (fsQCA).",
            "",
            "To use in publications, please cite as:",
            "        Dușa, Adrian (2007) User manual for the QCA(GUI) package in R,",
            "        Journal of Business Research 60(5), 576-586."
        ];
        
        for (var i = 0; i < messages.length; i++) {
            var text = strwrap(messages[i], 80, "  ").split(" ").join("&nbsp;");
            $("#about_main").append(text + "<br>");
        }
    }
});

$("#menu_changes").click(function() {
    
    pingit();
    
    var settings = {
        name:       "changes",
        title:      "Change log",
        position:   {my: "left top", at: "left+300px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      550,
        height:     420 + 10*(navigator.browserType == "Firefox")
    };
    
    if ($("#changes").length) {
        showDialogToFront(settings);
    }
    else {
        createDialog(settings);
        
        function getChanges() {
    
            updatecounter += 1;
            
            if (updatecounter < 21) {
                if (outres[0] != "listen2R") {
                    updatecounter = 0;
                    
                    for (var i = 0; i < outres.length; i++) {
                        var text = strwrap(outres[i].replace("      ", "       "), 80, "  ").split(" ").join("&nbsp;");
                        $("#changes_main").append(text + "<br>");
                    }
                }
                else {
                    setTimeout(getChanges, 50);
                }
            }
        }
        
        changes = 1;
        updatecounter = 0;
        outres[0] = "listen2R";
        Shiny.onInputChange("changes", changes);
        
        getChanges();
        
    }
});

$("#menu_help").click(function() {
    
    pingit();
    
    help += 1;
    Shiny.onInputChange("help", help);
});

$("#menu_quit").click(function() {
    var quit = 0;
    quit += 1;
    if (confirm("Close Window?")) {
        Shiny.onInputChange("quit", quit);
        close();
    }
});

createDialog({
    name:      "command",
    title:     "Command constructor",
    position:  {my: "right top", at: "right-10px top+33px", of: window, collision: "fitflip"},
    resizable: true,
    width:     665, 
    height:    commandHeight, 
    closable: false
    
});

createDialog({
    name:      "result",
    title:     "R console",
    position:  {my: "left top", at: "left bottom+4px", of: "#command", collision: "fitflip"},
    resizable: true,
    width:     665, 
    height:    resultHeight, 
    closable: false
});

var plotsettings = {
    name:      "plotdiv",
    title:     "R plot window",
    position:  {my: "right top", at: "left-10px top", of: "#command", collision: "fitflip"},
    resizable: true,
    width:     550,
    height:    570,
    closable: true
}

createDialog(plotsettings);

$("#plotdiv").resizable({
    stop: function() {
        plotsize[0] = $('#plotdiv_main').width()/96
        plotsize[1] = $('#plotdiv_main').height()/96;
        
        outres = new Array();
        outres[0] = "listen2R";
        Shiny.onInputChange("plotsize", plotsize);
        
        updatecounter = 0;
        resizePlot();
        
    }
})

$("#plotdiv").hide();

$("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
$("#result_main").append("<span style='color:blue'>library(QCA)</span><br>");
$("#result_main").append("<span style='color:red'>" + 
    "Loading required package: QCAGUI<br><br>" +
    "To cite this package in publications, please use:<br><br>" + 
    "  Dusa, Adrian (2007). User manual for the QCA(GUI) package in R.<br>".split(" ").join("&nbsp;") + 
    "  Journal of Business Research 60(5), 576-586.<br><br>".split(" ").join("&nbsp;"))
createCommandPromptInRconsole();

var keys = {
    cmd: false,
    ctrl: false,
    down: false
};

$("body").on("keydown", function(evt) {
    evt = evt || event; 
    var key = evt.which || evt.keyCode;
    
    if (key == 17) {
        keys["ctrl"] = true;
    }
    
    if (key == 91) {
        keys["cmd"] = true;
    }
    
    if (key == 40) {
        keys["down"] = true;
    }
    
    if ((keys["ctrl"] || keys["cmd"]) && keys["down"]) {
        
        if(!$("#txtarea").is(":focus")) {
            $("#tempdiv").click();
        }
        
        $("#result_main").animate({
            scrollTop: $("#result_main")[0].scrollHeight
        }, 1);
        
        keys = {
            cmd: false,
            ctrl: false,
            down: false
        }
    }
    
});

$("body").on("keyup", function(evt) {
    evt = evt || event; 
    var key = evt.which || evt.keyCode;
    
    if (key == 17) {
        keys["ctrl"] = false;
    }
    
    if (key == 91) {
        keys["cmd"] = false;
    }
    
    if (key == 40) {
        keys["down"] = false;
    }
});

$("#tempdiv").click();

function showDialogToFront(settings) {
    
    $("#" + settings.name).fadeIn();
    
    $("#" + settings.name).css("z-index", "9000");
    
    var scrollTop = {};
    var scrollLeft = {};
    
    scrollTop[settings.name + "_main"] = $("#" + settings.name + "_main").scrollTop();
    scrollLeft[settings.name + "_main"] = $("#" + settings.name + "_main").scrollLeft();
        
    if (settings.inside !== undefined) {
        var keys = getKeys(settings.inside);
        
        for (var i = 0; i < keys.length; i++) {
            scrollTop[keys[i]] = $("#" + keys[i]).scrollTop();
            scrollLeft[keys[i]] = $("#" + keys[i]).scrollLeft();
        }
    }
    
    $("#" + settings.name).appendTo(document.body);
    
    current_command = settings.name;
    if (settings.name != "command" && settings.name != "result") {
        console_command(current_command);
    }
    
    $("#" + settings.name + "_main").scrollTop(scrollTop[settings.name + "_main"]);
    $("#" + settings.name + "_main").scrollLeft(scrollLeft[settings.name + "_main"]);
    
    if (settings.inside !== undefined) {
        for (var i = 0; i < keys.length; i++) {
            $("#" + keys[i]).scrollTop(scrollTop[keys[i]]);
            $("#" + keys[i]).scrollLeft(scrollLeft[keys[i]]);
        }
    }
}

function createDialog(settings) {
    
    var dialog = document.createElement("div");
    dialog.id = settings.name;
    document.body.appendChild(dialog);
    
    current_command = settings.name;
    
    $("#" + settings.name).css({
        position: "absolute",
        width:  settings.width,
        height: settings.height
    }).position(settings.position);
    
    if (settings.name != "data_editor") {
        $("#" + settings.name).css({
            minWidth: settings.width,
            minHeight: settings.height
        });
    }
    
    $("#" + settings.name).addClass("outerborder");
    
    if (settings.resizable) {
        $("#" + settings.name).resizable({
            resize: function() {
                showDialogToFront(settings);
                $("#" + settings.name + "_main").css({
                    width: ($(this).width()) + "px",
                    height: ($(this).height() - 20) + "px"
                })
            }
        })
    }
    
    var header = document.createElement("div");
    header.id = settings.name + "_header";
    
    dialog = document.getElementById(settings.name);
    dialog.appendChild(header);
    
    document.getElementById(settings.name + "_header").style.fontWeight = "bold";
    document.getElementById(settings.name + "_header").style.padding = "1px 0px 0px 3px";
    
    $("#" + settings.name + "_header").addClass("header");
    
    header.innerHTML = settings.title;
    
    $("#" + settings.name + "_header").prepend('<img id="' + settings.name + '_img' + '" src="css/images/close.png" width="27px"/>')
    
    $("#" + settings.name + "_img").css({
        "vertical-align": "middle"
    }).mouseenter(function() {
        $(this).attr('src', 'css/images/closex.png');
    }).mouseleave(function() {
        $(this).attr('src', 'css/images/close.png');
    });
    
    var clickfired = false;
    
    $("#" + settings.name + "_img").mousedown(function(event) {
        clickfired = true;
    });
            
    $("#" + settings.name + "_img").click(function(event) {
        event.stopPropagation();
        
        if (settings.name == "plotdiv") {
            closeplot += 1;
            plotopen = false;
            Shiny.onInputChange("closeplot", closeplot);
            $("#preview").css({
                "background-image": ""
            });
        }
        
        if (settings.name != "command" && settings.name != "result") {
            
            $("#" + settings.name).remove();
        }
        
    });
    
    $("#" + settings.name + "_img").mouseup(function(event) {
        if (clickfired) {
            
            if (settings.name == "plotdiv") {
                closeplot += 1;
                plotopen = false;
                Shiny.onInputChange("closeplot", closeplot);
                $("#preview").css({
                    "background-image": ""
                });
            }
            
            if (settings.name != "command" && settings.name != "result") {
                
                $("#" + settings.name).remove();
            }
            
            clickfired = false;
        }
    });
    
    var body = document.createElement("div");
    body.id = settings.name + "_main";
    
    dialog.appendChild(body);
    
    $("#" + settings.name + "_main").css({
        width: ($("#" + settings.name).width()) + "px",
        height: ($("#" + settings.name).height() - 20) + "px"
    });
    
    document.getElementById(settings.name + "_main").style.background = "#ffffff";
    
    $("#" + settings.name).draggable({
        handle: "#" + settings.name + "_header",
        start: function() {
            
            showDialogToFront(settings);
        },
        stop: function() {
            if ($(this).offset().top < 31) {
                var left = $(this).offset().left;
                $(this).position({my: "left top", at: "left+" + left + "px top+31px", of: window, collision: "flip"});
            }
        }
    });
    
    if (settings.inside !== undefined) {
        var keys = getKeys(settings.inside);
        for (var i = 0; i < keys.length; i++) {
            addDiv(settings.name, keys[i], settings.inside[keys[i]]);
        }
    }
    
    var clientX, clientY;
    
    $("#" + settings.name).mousedown(function(event) {
        clientX = event.clientX;
        clientY = event.clientY;
    });
    
    $("#" + settings.name).click(function(event) {
        if (clientX == event.clientX && clientY == event.clientY) {
            showDialogToFront(settings);
        }
    });
    
    $("#" + settings.name).css("z-index", "9000");
    
    if (settings.name != "command" && settings.name != "result") {
        $("#" + settings.name).disableTextSelection();
    }
}

var venn = {
    "s1": [[[500,250,362.5,250,250,362.5,250,500,250,637.5,362.5,750,500,750,637.5,750,750,637.5,750,500,750,362.5,637.5,250,500,250]],[[0],[0]]],
    "s2": [[[500,716,333.5,618.5,333.5,381.5,500,284],[500,716,463.5,738,419,749.5,375,750,237.5,750,125,637.5,125,500,125,362.5,237.5,250,375,250,419,250,463.5,262,500,284],[500,284,536.5,262,581,250,625,250,762.5,250,875,362.5,875,500,875,637.5,762.5,750,625,750,581,749.5,536.5,738,500,716],[500,716,666.5,619,666.5,381.5,500,284]],[[1,2],[2,3],[0,1],[0,3]]],
    "s3": [[[250,391.5,250,256,361,142,500,142,639,142,750,256,750,391.5],[500,824.5,460,847.5,417.5,858,375,858,236.9,858,124.9,746.2,124.9,608.3,124.9,567.2,135.2,527.4,153.1,493,177.4,446.7,212.2,413.8,250,391.5],[250,391.5,250,488.5,304,568,375,608.5],[500,391.5,421.2,346.4,326.8,347.2,250,391.5],[375,608.5,374.5,521,422.5,436.5,500,391.5],[625,608.5,549.5,653,450.4,653,375,608.5],[625,608.5,625.4,695.8,577.3,780.4,500,824.5],[375,608.5,374.6,695.8,422.7,780.4,500,824.5],[625,608.5,625.5,521,577.5,436.5,500,391.5],[500,391.5,578.8,346.4,673.2,347.2,750,391.5],[750,391.5,750,488.5,696,568,625,608.5],[750,391.5,787.8,413.8,822.6,446.7,846.9,493,864.8,527.4,875.1,567.2,875.1,608.3,875.1,746.2,763.1,858,625,858,582.5,858,540,847.5,500,824.5]],[[0,11,1],[6,11,10],[0,9,3],[8,9,10],[1,2,7],[5,7,6],[2,4,3],[4,8,5]]],
    
    "s4": [[[359.9,344.3,406.8,297.3,453.7,250.4,500.8,203.3],[641.7,344.2,594.7,297.3,547.9,250.3,500.8,203.3],[765.2,467.7,724.1,426.6,682.9,385.5,641.7,344.2],[236.5,467.7,283,514.3,329.7,560.9,376.4,607.6],[625.3,607.7,583.8,566.2,542.3,524.7,500.8,483.2],[376.4,607.6,417.9,566.1,459.4,524.7,500.8,483.2],[359.9,344.3,365.8,348.9,371.5,353.9,376.9,359.3,418.7,400.8,459.5,441.9,500.8,483.2],[500.8,483.2,542,441.9,583.3,400.7,624.5,359.4,630,353.9,635.7,348.8,641.7,344.2],[691.2,769.8,711.7,761.2,730.9,748.5,747.7,731.7,753.4,726,759.1,720.4,764.8,714.7,833.3,646.1,833.7,536.2,765.2,467.7],[691.2,769.8,697.9,717.9,681.3,663.6,641.2,623.6,635.9,618.3,630.6,613,625.3,607.7],[310.3,770.2,303.5,718.2,320.2,663.8,360.3,623.7,365.7,618.3,371,613,376.4,607.6],[500.8,939.5,456.1,939.5,411.5,922.1,377.1,887.7,371.5,882.2,366.2,876.7,360.5,871.1,331.9,842.9,315.1,807.1,310.3,770.2],[500.8,939.5,545.5,939.6,590.7,922.8,624.6,888,630.1,882.3,635.9,876.9,641.4,871.2,670,842.7,686.4,806.7,691.2,769.8],[310.3,770.2,273.5,753.6,263.6,742.1,236.5,715,168,646.5,168,536.2,236.5,467.7],[186.3,321.2,194.2,270.3,213.4,240.3,253.1,203,321.6,134.5,432.3,134.8,500.8,203.3],[500.8,203.3,569.3,134.8,679.6,134.8,748.2,203.3,791.3,244.1,806.9,272.5,815.1,321.4],[815.1,321.4,845,335.1,854.7,341.7,888.9,376.5,957.4,445,957.4,555.3,888.9,623.8,800.8,711.9,712.7,799.9,624.6,888,590.3,922.4,545.5,939.6,500.8,939.5],[500.8,939.5,456.1,939.5,411.5,922.1,377.1,887.7,289,799.6,201.9,712.5,112.8,623.4,43.17,554.9,43.17,444.6,112.2,376.7,134.3,354.5,149.9,336.9,186.3,321.2],[765.2,467.7,718.6,514.3,672,561,625.3,607.7],[376.4,607.6,418,649.2,459.4,690.7,500.8,732.1],[625.3,607.7,583.8,649.2,542.3,690.6,500.8,732.1],[236.5,467.7,277.6,426.6,318.6,385.5,359.9,344.3],[641.7,344.2,692.1,305.4,758.4,297.8,815.1,321.4],[359.9,344.3,309.6,305.4,242.9,297.8,186.3,321.2],[815.1,321.4,821.9,373.3,805.2,427.6,765.2,467.7],[500.8,732.1,449.1,783.9,373.7,796.5,310.3,770.2],[186.3,321.2,179.7,373.2,196.5,427.7,236.5,467.7],[500.8,732.1,552.5,783.8,627.9,796.3,691.2,769.8]],[[14,15,16,17],[8,24,16,12],[1,15,22],[2,22,24],[0,14,23],[8,18,9],[0,1,7,6],[2,7,4,18],[11,13,26,17],[11,25,27,12],[3,10,13],[10,19,25],[21,23,26],[9,20,27],[3,5,6,21],[4,5,19,20]]],
    
    "s5": [[[757,276.8,705.7,268.3,668.3,268.6,620.7,286.6],[620.7,286.6,590.6,297.2,567.3,309.2,548.2,322.1],[548.2,322.1,516.4,343.7,496.2,367.8,475.3,392.1],[475.3,392.1,443.3,431.9,407.9,457.6,367.2,481.1],[367.2,481.1,342.6,495.2,316.9,509.4,295.2,525.2],[295.2,525.2,265,547.3,242.7,572.6,242.3,606.1],[242.3,606.1,241.9,654.1,274.2,686.8,325,693.5],[325,693.5,360.3,698.1,402.8,693,443.9,690.5],[443.9,690.5,477,688.5,507.7,689.4,538,695.7],[538,695.7,566.2,701.4,590.1,709.8,615.7,716],[615.7,716,693.3,730,732.5,723.8,787.8,701.9],[757,276.8,831.6,294.8,894.8,350.7,918.6,429.2,952.5,540.9,894.6,659.2,787.8,701.9],[348.9,169.4,321,211.9,309.2,247.4,310.4,307.6],[310.4,307.6,311.2,340.9,315.5,367.7,322.2,390.5],[322.2,390.5,333.1,427.7,350,454.3,367.2,481.1],[367.2,481.1,395.6,522.6,411.6,560,422.5,605.3],[422.5,605.3,429.3,633.7,435.2,663.7,443.9,690.5],[443.9,690.5,455.1,725.4,470.9,754.7,499.5,767.5],[499.5,767.5,553.4,788,592.4,760.5,615.7,716],[615.7,716,630,683.9,637.4,642.9,646.6,603.8],[646.6,603.8,654.4,569.3,665.5,538.2,681.4,509.1],[681.4,509.1,693.5,487.5,706.3,469.3,718,449.8],[718,449.8,748.1,395.6,761.6,364.3,757,276.8],[348.9,169.4,389.2,110.3,457.1,71.49,533.9,71.49,651.2,71.49,747.8,161.9,757,276.8],[393.5,855.2,440.8,832.4,472.6,805.3,499.5,767.5],[499.5,767.5,518.2,741.1,530.1,717.7,538,695.7],[538,695.7,551,659.9,553.2,628.3,556.4,596],[556.4,596,559.5,546,574.1,504.5,594,462.8],[594,462.8,606,437.6,618.9,412,627.5,387.2],[627.5,387.2,640.6,349.9,644,314.9,620.7,286.6],[620.7,286.6,580.5,238.8,540.9,249.5,505.2,268.6],[505.2,268.6,474.2,284.9,443.1,312.2,411.4,337],[411.4,337,383.1,359.6,353.7,377.7,322.2,390.5],[322.2,390.5,298.9,399.9,277.2,406.3,255.3,415],[255.3,415,191.6,450.3,156.6,466.8,120.5,527.6],[393.5,855.2,321.3,884.4,235.7,875,170.1,823.4,79.32,750.8,59.69,622.6,120.5,527.6],[120.5,527.6,158.3,568,195.7,592.2,242.3,606.1],[242.3,606.1,272.2,615.1,297.5,618.9,320.3,619.7],[320.3,619.7,359.4,621,390.4,612.9,422.5,605.3],[422.5,605.3,469.7,592.3,511.4,591.1,556.4,596],[556.4,596,586.6,599.3,617.9,603.9,646.6,603.8],[646.6,603.8,684.3,603.7,717.3,595.8,736.8,566.7],[736.8,566.7,766.2,522.8,756.5,482.3,718,449.8],[718,449.8,693.6,427.3,659.7,407.7,627.5,387.2],[627.5,387.2,596.6,367.5,571,347.8,548.2,322.1],[548.2,322.1,531.9,303.9,519.2,285.9,505.2,268.6],[505.2,268.6,461.3,214.8,422.8,187.6,348.9,169.4],[120.5,527.6,74.02,469,57.84,388.6,84.78,313.3,123.4,203.4,238.9,143.2,348.9,169.4],[787.8,701.9,781.1,647.5,765.9,604.4,736.8,566.7],[736.8,566.7,717.8,541.5,699.3,523.1,681.4,509.1],[681.4,509.1,651.7,485.9,623,474.3,594,462.8],[594,462.8,545.9,445.3,510.7,423.4,475.3,392.1],[475.3,392.1,454.2,373.5,433,353.3,411.4,337],[411.4,337,378.5,312,345,295.9,310.4,307.6],[310.4,307.6,263,327.7,243.7,363.3,255.3,415],[255.3,415,262.4,449.5,280.2,487.6,295.2,525.2],[295.2,525.2,308.1,557,316.8,587.8,320.3,619.7],[320.3,619.7,323.1,645.8,323,669.4,325,693.5],[325,693.5,340.2,765.1,348.1,799.5,393.5,855.2],[787.8,701.9,790.5,775.2,757.2,848.2,693,893.1,597.7,960.7,467.4,942.6,393.5,855.2]],[[11,59,35,47,23],[6,58,35,36],[10,59,24,18],[7,17,24,58],[11,48,42,22],[6,57,37],[10,48,41,19],[7,16,38,57],[0,30,46,23],[1,45,30],[9,18,25],[8,25,17],[0,29,43,22],[1,44,29],[9,19,40,26],[8,26,39,16],[12,54,34,47],[5,36,34,55],[13,33,54],[4,55,33,14],[21,42,49],[5,37,56],[20,49,41],[4,56,38,15],[12,53,31,46],[2,52,31,45],[13,32,53],[3,14,32,52],[21,43,28,50],[2,51,28,44],[20,50,27,40],[3,15,39,27,51]]],
    "s6": [[[556,151,610,127,670,135,685,192],[685,192,689,206,692,222,693,237],[693,237,695,263,695,276,695,302],[695,302,695,333,695,364,695,406],[695,406,694,462,685,592,664,680],[664,680,656,713,646,734,631,757],[631,757,614,782,600,799,580,817],[580,817,558,837,528,855,497,869],[497,869,457,889,399,897,361,898],[361,898,196,898,51,766,81,561],[81,561,87,522,98,493,116,466],[116,466,129,447,145,433,162,420],[162,420,176,409,195,397,210,387],[210,387,254,359,270,337,275,297],[275,297,278,277,271,252,285,222],[285,222,305,182,342,169,385,182],[385,182,432,196,459,191,495,177],[495,177,516,168,535,160,556,151],[767,211,918,266,1022,444,922,611],[922,611,864,700,826,735,748,759],[748,759,719,765,703,766,673,764],[673,764,654,762,644,760,631,757],[631,757,568,742,555,759,523,795],[523,795,506,815,481,839,464,845],[464,845,428,860,391,853,366,818],[366,818,348,791,337,773,291,768],[291,768,262,765,231,762,202,754],[202,754,146,738,119,701,136,642],[136,642,143,619,149,609,158,592],[158,592,173,567,176,560,190,540],[190,540,204,520,224,493,232,482],[232,482,306,389,391,305,455,255],[455,255,478,237,488,230,522,214],[522,214,542,205,563,198,585,194],[585,194,623,189,653,188,685,192],[685,192,718,196,745,203,767,211],[747,312,765,316,785,321,803,327],[803,327,857,347,867,398,849,436],[849,436,840,454,830,472,813,492],[813,492,796,511,788,520,767,543],[767,543,739,577,726,595,733,646],[733,646,736,667,740,676,743,698],[743,698,746,719,748,741,748,759],[748,759,748,796,740,822,723,849],[723,849,657,966,453,977,361,898],[361,898,337,879,323,857,313,838],[313,838,302,818,295,801,291,768],[291,768,289,748,288,742,288,722],[288,722,288,672,270,667,226,639],[226,639,207,627,177,609,158,592],[158,592,136,573,127,543,151,506],[151,506,173,472,171,448,162,420],[162,420,152,387,146,361,145,327],[145,327,143,265,168,209,240,215],[240,215,249,216,269,219,285,222],[285,222,306,226,336,232,352,235],[352,235,382,241,421,248,455,255],[455,255,511,266,552,274,625,288],[625,288,645,292,670,297,695,302],[695,302,713,306,728,308,747,312],[695,406,705,414,746,444,763,455],[763,455,774,463,791,475,813,492],[813,492,828,504,847,519,864,536],[864,536,885,557,908,583,922,611],[922,611,981,733,865,862,723,849],[723,849,692,847,675,844,645,837],[645,837,620,831,595,823,580,817],[580,817,557,808,541,802,523,795],[523,795,480,780,458,776,412,796],[412,796,401,801,386,808,366,818],[366,818,357,823,334,833,313,838],[313,838,241,853,202,803,202,754],[202,754,202,736,206,715,211,695],[211,695,216,676,221,658,226,639],[226,639,236,599,228,570,190,540],[190,540,180,531,163,517,151,506],[151,506,136,493,125,480,116,466],[116,466,86,416,99,354,145,327],[145,327,162,318,183,313,209,311],[209,311,237,309,257,304,275,297],[275,297,318,281,336,260,352,235],[352,235,363,218,374,198,385,182],[385,182,399,160,412,143,435,130],[435,130,474,110,526,117,556,151],[556,151,568,164,575,176,585,194],[585,194,593,208,601,230,608,245],[608,245,614,258,619,275,625,288],[625,288,649,343,654,373,695,406],[608,245,632,243,669,238,693,237],[693,237,737,236,746,259,747,312],[747,312,748,342,754,373,792,398],[792,398,809,410,831,424,849,436],[849,436,897,467,894,497,864,536],[864,536,846,559,824,580,800,600],[800,600,787,612,757,633,733,646],[733,646,711,658,689,669,664,680],[664,680,571,723,456,742,361,734],[361,734,328,731,315,728,288,722],[288,722,269,717,232,705,211,695],[211,695,179,681,158,663,136,642],[136,642,105,608,97,593,81,561],[81,561,-5,388,68,126,320,117],[320,117,380,117,411,122,435,130],[435,130,456,138,479,155,495,177],[495,177,503,188,513,203,522,214],[522,214,540,236,562,250,608,245],[803,327,805,354,803,372,792,398],[792,398,783,419,775,433,763,455],[763,455,746,487,745,503,767,543],[767,543,778,564,790,577,800,600],[800,600,820,642,800,687,743,698],[743,698,715,704,685,710,673,764],[673,764,668,788,658,815,645,837],[645,837,626,874,565,908,497,869],[497,869,483,860,473,852,464,845],[464,845,448,833,428,812,412,796],[412,796,394,777,377,757,361,734],[361,734,306,655,265,577,232,482],[232,482,223,456,214,415,210,387],[210,387,207,365,207,335,209,311],[209,311,212,277,223,244,240,215],[240,215,260,176,288,142,320,117],[320,117,448,16,683,41,767,211],[767,211,781,239,800,282,803,327]],[[9,101,122,18,64,44],[9,100,27,71,45],[8,44,65,113],[8,45,70,24,114],[19,43,64],[26,71,46],[20,112,65,43],[25,46,70],[18,63,92,37,123],[27,99,72],[37,91,106],[24,69,115],[19,42,110,93,63],[26,72,98,47],[20,111,42],[25,47,97,116,69],[0,35,122,102,83],[0,34,84],[7,113,66],[7,114,23,67],[17,83,103],[17,84,33,104],[6,66,112,21],[6,67,22],[1,89,36,123,35],[1,88,85,34],[36,106,90],[23,115,68],[41,110,94],[33,85,105],[5,21,111,41,95],[5,22,68,116,96],[10,77,53,121,101],[10,76,50,28,100],[53,120,78],[29,75,50],[11,52,77],[11,51,76],[12,119,78,52],[12,118,30,75,51],[38,62,92],[28,49,73,99],[38,61,107,91],[29,74,49],[39,109,93,62],[48,73,98],[39,108,61],[30,117,97,48,74],[15,82,102,121,54],[15,81,55],[14,54,120,79],[14,55,80],[16,103,82],[16,104,32,56,81],[13,79,119],[13,80,56,31,118],[2,59,89],[2,58,86,88],[3,60,107,90,59],[3,87,58],[40,94,109],[32,105,86,57],[4,95,40,108,60],[4,96,117,31,57,87]]],
    "s7": [[[179,584,197,592,213,595,230,600],[230,600,245,604,258,606,272,607],[272,607,288,608,297,608,316,609],[316,609,351,610,370,630,368,668],[368,668,367,685,366,698,366,713],[366,713,366,730,366,745,367,760],[367,760,368,776,371,793,375,808],[375,808,379,826,383,837,389,853],[718,812,684,1014,450,1016,389,853],[718,812,721,795,721,776,721,760],[721,760,721,742,720,726,717,709],[717,709,714,693,713,682,709,666],[709,666,706,644,712,633,736,628],[736,628,752,625,765,625,781,623],[781,623,815,618,819,595,797,571],[797,571,788,560,776,551,768,540],[768,540,756,521,757,508,772,493],[772,493,783,483,796,476,807,467],[807,467,837,443,826,424,804,413],[804,413,790,406,778,402,760,399],[760,399,740,397,726,397,711,397],[711,397,694,398,681,398,668,399],[668,399,603,402,556,377,534,312],[534,312,528,295,524,284,517,269],[517,269,510,255,504,243,496,230],[496,230,488,217,481,205,472,194],[472,194,460,180,449,167,432,155],[432,155,387,123,331,140,322,205],[322,205,320,226,320,240,321,262],[321,262,322,278,324,291,327,306],[327,306,331,321,334,332,338,346],[338,346,349,384,346,405,304,415],[304,415,288,418,272,421,257,425],[257,425,241,429,222,435,207,441],[207,441,193,447,183,451,168,461],[168,461,116,494,118,561,179,584],[496,153,486,167,483,171,472,194],[472,194,467,205,461,216,453,238],[453,238,448,253,446,262,441,278],[441,278,429,320,417,328,372,317],[372,317,355,313,342,310,327,306],[327,306,311,302,296,299,280,297],[280,297,265,295,250,294,236,294],[236,294,219,295,203,296,185,299],[150,627,-16,568,-9,333,185,299],[150,627,168,634,185,638,204,642],[204,642,220,646,235,648,251,649],[251,649,266,650,280,650,294,651],[294,651,317,652,327,660,327,683],[327,683,327,700,324,713,323,729],[323,729,321,761,341,774,367,760],[367,760,382,751,396,743,408,736],[408,736,427,725,441,728,450,748],[450,748,455,759,461,776,468,789],[468,789,482,816,503,821,525,794],[525,794,533,784,540,775,547,756],[547,756,554,739,557,728,560,714],[560,714,563,699,565,681,568,667],[568,667,581,604,624,571,685,560],[685,560,701,557,715,554,730,551],[730,551,745,548,754,545,768,540],[768,540,785,533,798,527,812,520],[812,520,828,512,838,505,851,495],[851,495,905,453,893,395,832,376],[832,376,814,370,803,367,780,364],[780,364,754,361,747,361,730,361],[730,361,716,361,703,362,689,362],[689,362,645,364,629,345,633,307],[633,307,635,289,635,275,635,259],[635,259,635,241,634,226,631,212],[631,212,626,188,621,177,616,165],[616,165,594,108,535,100,496,153],[763,271,748,273,738,273,718,278],[718,278,703,281,689,286,675,291],[675,291,661,296,646,301,633,307],[633,307,600,321,583,316,563,274],[563,274,552,249,551,245,545,232],[545,232,537,216,528,200,522,190],[522,190,508,169,504,163,496,153],[496,153,475,129,468,121,456,110],[185,299,121,101,331,-10,456,110],[185,299,190,314,196,331,203,344],[203,344,212,361,219,372,231,390],[231,390,239,402,248,413,257,425],[257,425,272,446,268,458,243,472],[243,472,231,479,220,485,209,493],[209,493,185,510,185,530,213,546],[213,546,230,555,241,558,258,565],[258,565,282,575,282,586,272,607],[272,607,264,622,257,635,251,649],[251,649,241,675,251,690,281,690],[281,690,296,690,315,686,327,683],[327,683,341,679,355,674,368,668],[368,668,378,662,396,655,408,648],[408,648,465,620,525,625,568,667],[568,667,580,679,589,687,600,697],[600,697,611,706,620,714,632,723],[632,723,647,733,664,742,678,748],[678,748,692,753,706,757,721,760],[721,760,782,771,823,731,802,667],[802,667,796,648,788,635,781,623],[781,623,770,605,760,592,753,582],[753,582,746,571,739,562,730,551],[730,551,705,521,705,494,734,473],[734,473,747,464,757,458,770,447],[770,447,785,434,793,426,804,413],[804,413,816,400,822,391,832,376],[832,376,870,320,842,265,763,271],[845,550,828,532,824,529,812,520],[812,520,796,507,785,500,772,493],[772,493,757,486,748,481,734,473],[734,473,699,454,691,434,711,397],[711,397,722,378,724,373,730,361],[730,361,737,347,744,332,749,318],[749,318,755,302,759,289,763,271],[763,271,767,250,769,237,771,214],[456,110,545,-35,791,29,771,214],[456,110,448,123,441,133,432,155],[432,155,426,170,420,187,415,206],[415,206,411,222,409,233,406,249],[406,249,400,278,394,285,364,276],[364,276,346,271,335,266,321,262],[321,262,287,251,272,264,280,297],[280,297,285,313,287,317,296,339],[296,339,307,365,300,373,277,380],[277,380,258,385,247,387,231,390],[231,390,196,396,188,414,207,441],[207,441,214,451,228,462,243,472],[243,472,256,481,268,486,280,492],[280,492,295,499,310,507,322,513],[322,513,375,541,412,572,408,648],[408,648,407,662,406,673,405,692],[405,692,405,705,404,712,408,736],[408,736,410,751,413,766,417,780],[417,780,422,796,426,807,433,822],[433,822,459,876,529,888,561,831],[561,831,570,816,575,802,580,788],[580,788,587,768,588,764,592,744],[592,744,596,723,599,709,600,697],[600,697,605,656,633,646,667,655],[667,655,682,658,693,662,709,666],[709,666,719,669,740,671,756,671],[756,671,774,671,785,670,802,667],[802,667,877,653,889,600,845,550],[673,796,676,778,677,766,678,748],[678,748,679,731,678,714,675,697],[675,697,673,682,671,669,667,655],[667,655,658,619,669,598,708,589],[708,589,724,586,739,584,753,582],[753,582,768,580,782,576,797,571],[797,571,813,566,831,557,845,550],[845,550,859,542,872,535,885,526],[771,214,965,190,1050,415,885,526],[771,214,754,216,739,221,723,225],[723,225,706,229,691,234,676,240],[676,240,661,247,649,253,635,259],[635,259,610,270,602,265,592,242],[592,242,586,225,581,211,576,199],[576,199,566,173,541,166,522,190],[522,190,511,205,508,211,496,230],[496,230,483,249,472,251,453,238],[453,238,437,225,424,215,415,206],[415,206,391,182,363,192,362,221],[362,221,361,238,361,241,364,276],[364,276,367,295,369,303,372,317],[372,317,375,329,376,334,381,358],[381,358,401,440,384,470,322,513],[322,513,311,521,301,527,291,535],[291,535,283,541,271,552,258,565],[258,565,243,580,238,589,230,600],[230,600,222,610,212,626,204,642],[204,642,177,694,209,747,272,740],[272,740,289,738,304,735,323,729],[323,729,339,724,352,719,366,713],[366,713,380,706,392,699,405,692],[405,692,434,673,469,677,483,709],[483,709,491,727,494,736,500,752],[500,752,503,760,513,781,525,794],[525,794,540,813,545,818,561,831],[561,831,609,870,662,861,673,796],[375,808,399,796,405,790,417,780],[417,780,430,770,445,754,450,748],[450,748,461,734,472,721,483,709],[483,709,506,686,537,689,560,714],[560,714,571,726,581,735,592,744],[592,744,602,753,616,763,626,770],[626,770,641,781,655,788,673,796],[673,796,687,802,704,808,718,812],[885,526,1025,670,895,870,718,812],[885,526,873,515,864,505,851,495],[851,495,836,484,822,476,807,467],[807,467,794,460,782,454,770,447],[770,447,752,434,749,421,760,399],[760,399,767,386,774,375,780,364],[780,364,797,335,780,316,749,318],[749,318,735,319,721,321,707,321],[707,321,685,322,675,314,675,291],[675,291,676,269,677,258,676,240],[676,240,674,208,661,197,631,212],[631,212,617,220,603,231,592,242],[592,242,576,259,573,263,563,274],[563,274,553,287,543,300,534,312],[534,312,495,365,450,379,381,358],[381,358,367,353,351,349,338,346],[338,346,325,343,314,341,296,339],[296,339,284,338,266,337,253,338],[253,338,235,339,218,341,203,344],[203,344,135,359,121,420,168,461],[168,461,181,473,189,480,209,493],[209,493,217,498,233,508,247,515],[247,515,257,520,273,527,291,535],[291,535,324,550,336,577,316,609],[316,609,307,624,301,634,294,651],[294,651,288,666,284,680,281,690],[281,690,276,707,273,723,272,740],[272,740,268,806,316,839,375,808],[236,294,241,309,246,321,253,338],[253,338,257,348,264,362,277,380],[277,380,287,393,296,403,304,415],[304,415,328,451,320,466,280,492],[280,492,269,499,258,506,247,515],[247,515,235,525,224,536,213,546],[213,546,198,561,188,572,179,584],[179,584,169,598,159,611,150,627],[389,853,214,959,50,785,150,627],[389,853,405,843,418,834,433,822],[433,822,445,811,457,801,468,789],[468,789,479,776,488,765,500,752],[500,752,515,736,530,736,547,756],[547,756,559,769,568,780,580,788],[580,788,600,802,620,797,626,770],[626,770,630,755,629,743,632,723],[632,723,635,700,653,690,675,697],[675,697,688,700,703,706,717,709],[717,709,754,717,763,697,756,671],[756,671,751,652,743,637,736,628],[736,628,723,609,718,602,708,589],[708,589,699,578,694,572,685,560],[685,560,649,509,639,456,668,399],[668,399,675,387,682,374,689,362],[689,362,697,348,702,335,707,321],[707,321,714,302,716,289,718,278],[718,278,722,258,722,244,723,225],[723,225,726,161,668,129,616,165],[616,165,605,173,592,183,576,199],[576,199,565,210,554,221,545,232],[545,232,534,245,527,256,517,269],[517,269,494,301,470,302,441,278],[441,278,419,258,420,260,406,249],[406,249,394,240,375,227,362,221],[362,221,345,213,337,210,322,205],[322,205,253,184,212,221,236,294]],[[8,188,152,116,80,44,224],[35,223,44,81,207],[7,224,45,171,215],[0,170,45,223],[8,187,179,135,225],[35,222,86,208],[7,225,134,180],[0,169,87,222],[9,99,143,151,188],[34,207,82,126],[6,215,172,50],[5,50,173],[9,98,144,187],[34,208,85,127],[6,180,133,51],[5,51,132,174],[63,107,115,152,189],[18,106,63,190],[46,90,214,171],[1,89,46,170],[136,230,186,179],[18,105,191],[137,185,230],[1,88,169],[62,189,151,108],[17,190,62,109],[49,172,214,91],[4,173,49,92],[97,144,186,231],[17,191,104,110],[96,231,185,138],[4,174,131,93],[71,79,116,153,243],[71,78,158,244],[70,243,154,198],[70,244,157,199],[54,178,135,226],[54,177,227],[53,226,134,181],[53,227,176,182],[14,150,143,100],[33,126,83],[69,198,155],[69,199,156],[14,149,101],[33,127,84],[52,181,133],[52,182,175,132],[72,242,153,115],[77,158,245],[73,197,154,242],[76,245,157,200],[55,229,136,178],[55,228,177],[56,184,137,229],[56,183,176,228],[15,61,108,150],[16,109,61],[68,155,197,74],[68,156,200,75],[15,60,102,149],[16,110,103,60],[57,95,138,184],[57,94,131,175,183],[27,251,43,80,117],[43,81,206,216],[28,122,42,251],[42,216,205,123],[27,250,162,118],[86,221,209],[28,121,163,250],[87,168,210,221],[10,234,142,99],[82,125,217,206],[11,141,234],[124,217,205],[10,233,145,98],[85,209,220,128],[11,140,146,233],[129,167,210,220],[64,194,114,107],[19,193,64,106],[47,213,90],[2,212,47,89],[119,249,162],[19,192,105],[120,163,249],[2,211,168,88],[65,113,194],[20,112,65,193],[48,91,213],[3,92,48,212],[97,145,232],[20,111,104,192],[96,232,146,139],[3,93,130,167,211],[26,117,79,36],[25,36,78,159],[29,41,122],[30,204,123,41],[26,118,161,37],[25,37,160],[29,40,164,121],[30,203,165,40],[13,100,142,235],[32,83,125,218],[12,235,141],[31,218,124,204],[13,101,148,236],[32,84,128,219],[12,236,147,140],[31,219,129,166,203],[72,241,195,114],[24,159,77,246],[73,196,241],[23,246,76,201],[38,248,119,161],[24,160,38,247],[39,164,120,248],[23,247,39,165,202],[66,240,195,113],[21,239,66,112],[67,74,196,240],[22,201,75,67,239],[59,102,148,237],[21,238,59,103,111],[58,237,147,139,95],[22,202,166,130,94,58,238]]],
    
    "l1": {
        "x": [485],
        "y": [213]
    },
    "l2": {
        "x": [100, 888],
        "y": [300, 300]
    },
    "l3": {
        "x": [100, 500, 900],
        "y": [440,  90, 440]
    },
    "l4": {
        "x": [ 75, 220, 780, 925],
        "y": [330, 140, 140, 330]
    },
    
    "l5": {
        "x": [ 90, 533, 885, 700, 163],
        "y": [200,  38, 280, 960, 890]
    },
    
    "l6": {
        "x": [100, 500, 910, 925, 550, 100],
        "y": [140,  25, 225, 835, 970, 860]
    },
    "l7": {
        "x": [220, 685, 935, 935, 600, 155,  50],
        "y": [ 45,  23, 220, 800, 985, 880, 310]
    }
}

}); 
