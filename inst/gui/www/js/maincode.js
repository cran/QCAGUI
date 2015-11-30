$( function() {
//

$('#main_menu').smartmenus({
    subMenusSubOffsetX: 6,
    subMenusSubOffsetY: -8
});



// initialize all globals
var theData = "";
var dataCoords = "";

// These are zero based (there are actually 17 rows and 8 columns)
var visiblerows = 16, visiblecols = 7;


var gridset, datacover;

//data editor dialog (outer) heigth and width, must store in case of resize
var deheight = 400, dewidth = 659;

// 0. start row; 1. start col; 2. how many rows, 3. how many cols
var scrollvh = [0, 0, visiblerows, visiblecols];

var tempdirfile = "";
var imported_filename = "";
var dirfile = "";
var dirfile_chosen = ["dir", "~", ""];
var rects_width;
var canvas_height;
var tempdatainfo = {ncols: 0, nrows: 0, colnames: [], rownames: []};
var datainfo = {ncols: 0, nrows: 0, colnames: [], rownames: []};
var ovBox, input; // input is needed as a global, used in mycode.js
var tasta = "enter";
var import_open = "";
    import_open.obj = ["dir", ""];
var outres = new Array(); // the output returned from R


var windowHeight = window.innerHeight;
var commandHeight = 100, resultHeight = 600;

if (windowHeight < 600) {
    resultHeight = 300;
    commandHeight = 75;
}

var string_command = "";

var dirfilevisit = false;
var eqmcc2R, tt2R, calib2R;

// to store which variables are selected (clicked)
// from which dialogs, from which columns div
// true / false
var colclicks = new Array();


var current_command = "";
var objname = "";

// object to send something to R when the user changed something
// in the data editor
// ex. [row, col, value], but also ["r", 3, value] for the third rowname
var dataModif = new Array(3);

var testX = 80, testY = 33;

// size of either width or height of the scrollbars
var scrollbarsWH = getScrollBarWidth();

// necessary to check when and if the visible data has changed
// updatecounter is a safety device to break the updateWhenDataChanged() function
// if both visible data and data coordinates are the same
var visibledata, updatecounter = 0, updatecounter2 = 0;

// necessary to check when and if the structure of files and directories changed
var pathcopy;

// necessary to check when and if the output window information changed
var outputcopy, coordscopy;

var dirsfilescopy;
var dirfilist = {
    refresh: true,
    value: 0
}


// to get the thresholds in the calibrate dialog
// number of thresholds (crisp sets); name of the condition; something to produce any change
var thinfo = [1, "", 0];

var thvalsfromR = new Array();
var ths = new Array(6);


// to get all values for a certain causal condition, for the thresholds setter
var thsetter2R = {
    counter: 0,
    cond: ""
}
var thsetter_content;
var thsetter_vals = new Array();
var thsetter_jitter = new Array();
var lastvals = new Array();

var xyplotdata = new Array();

var rloadcycles = 0;

var eqmccfromR = new Array();
var ttfromR = new Array();

var papers = {}; // the Raphael papers




/* --------------------------------------------------------------------- */




var read_table, importobj, exportobj, eqmcc, tt, calibrate, recode, xyplot;
// create the communication (with R) objects 




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
        "outcome": new Array(),
        "neg_out": false,
        "conditions": new Array(),
        "relation": "suf",
        "n_cut": "1",
        "incl_cut1": "1",
        "incl_cut0": "1",
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
        "PRI": false
    };
};


function reset_tt() {
    var ttcounter = (tt == void 0)?0:tt.counter;
    tt = {
        "counter": ttcounter,
        "outcome": new Array(1),
        "neg_out": false,
        "conditions": new Array(),
        "n_cut": "1",
        "incl_cut1": "1",
        "incl_cut0": "1",
        "complete": false,
        "show_cases": false,
        "sort_by": {"out": true, "incl": true, "n": true},
        "sort_sel": {"out": false, "incl": false, "n": false},
        "decreasing": true,
        "use_letters": false,
        "inf_test": "",
        "PRI": false
    };
};


function reset_calibrate() {
    var calcounter = (calibrate == void 0)?0:calibrate.counter;
    calibrate = {
        "counter": calcounter,
        "x": new Array(),
        "type": "crisp",
        "thresholds": new Array(1), // there is at least one threshold in the crisp case
        "thnames": new Array(),
        "thscopycrp": ["", "", ""],
        "thscopyfuz": ["", "", "", "", "", ""],
        "include": true,
        "logistic": true,
        "idm": "0.95",
        "ecdf": false,
        "p": "1",
        "q": "1",
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
    //lastvals = new Array();
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


reset_read_table(); 
reset_export(); 
reset_eqmcc();
reset_tt();
reset_calibrate();
reset_recode();
reset_xyplot();





/* --------------------------------------------------------------------- */




// create functions to receive answers from R


// temporary information for the read.table() communication
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

// definite information when the "Import" button is pressed
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
        //refresh_cols("all");
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
            ttfromR = object[1][0]; // I could just make it object[1] but maybe I need something else from eqmcc
            if ($("#venn").length) {
                papers["venn_main"].customtext = "";
            }
            draw_venn(papers["venn_main"]);
            // eqmccfromR = something else from object[1][...1...] etc.
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

Shiny.addCustomMessageHandler("thvalsfromR",
    function(object) {
        thvalsfromR = object;
    }
);

Shiny.addCustomMessageHandler("dataPoints",
    function(object) {
        thsetter_vals = object;
    }
);

Shiny.addCustomMessageHandler("xyplot",
    function(object) {
        xyplotdata = object;
    }
);





/* --------------------------------------------------------------------- */





$("body").on("focus", "input, textarea", function() {
    $(this).on('keyup', function(evt) {
        if (evt.keyCode == 27) { // escape
            tasta = "escape";
            input.blur();
        }
    });
    
    $(this).on('keypress', function(evt) {
        var key = evt.which || evt.keyCode;
        if (key == 13) { // enter
            tasta = "enter";
            input.blur();
        }
    });
});





/* --------------------------------------------------------------------- */





function console_command(type) {
    
    current_command = type;
    string_command = "";
    objname = "";
    
    if (type == "import") {
        //console.trace("console_command: import");
        
        if (dirfile.filepath != "") {
            
            //console.log(dirfile.filepath[0][0]);
            
            string_command = ((read_table.filename != "")?read_table.filename:dirfile.filename) + " <- ";
            if (read_table.sep == ",") {
                string_command = string_command + "read.csv(\"" + 
                //dirfile.filepath + "\"" + 
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
        
        // for both eqmcc and tt, the filename should exist, otherwise nothing
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
                
                //console.log(colclicks.eqmcc.outcome);
                var outcome = getTrueKeys(colclicks.eqmcc.outcome);
                var conditions = getTrueKeys(colclicks.eqmcc.conditions);
                objname <- "qmc";
                string_command = "eqmcc(" + ((read_table.filename != "")?read_table.filename:imported_filename);
                
                if (outcome.length > 0) {
                    string_command += ", outcome = \"";
                    
                    for (var i = 0; i < outcome.length; i++) {
                        string_command += outcome[i] + ((i == outcome.length - 1)?"\"":", ");
                    }
                }
                
                if (eqmcc.neg_out) {
                    string_command += ", neg.out = TRUE";
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
                
                if (eqmcc.incl_cut1 != "1") {
                    
                    string_command += ", incl.cut1 = " + eqmcc.incl_cut1;
                }
                
                if (eqmcc.incl_cut0 != "1") {
                    string_command += ", incl.cut0 = " + eqmcc.incl_cut0;
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
                
                if (eqmcc.PRI) {
                    string_command += ", PRI = TRUE";
                }
                
                string_command += ")";
                
            }
            
            
            if (type == "tt") {
                
                //console.log(colclicks.tt);
                var outcome = getTrueKeys(colclicks.tt.outcome);
                var conditions = getTrueKeys(colclicks.tt.conditions);
                objname = "tt";
                
                string_command = objname + " <- " + "truthTable(" + ((read_table.filename != "")?read_table.filename:imported_filename);
                
                if (outcome.length > 0) {
                    string_command += ", outcome = \"" + outcome + "\"";
                }
                
                if (tt.neg_out) {
                    string_command += ", neg.out = TRUE";
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
                
                if (tt.incl_cut1 != "1") {
                    
                    string_command += ", incl.cut1 = " + tt.incl_cut1;
                }
                
                if (tt.incl_cut0 != "1") {
                    string_command += ", incl.cut0 = " + tt.incl_cut0;
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
                        string_command += sorts[i] + "=" +
                                          ((tt.sort_by[sorts[i]])?"TRUE":"FALSE") +
                                          ((i == sorts.length - 1)?"\"":", ");
                    }
                }
                
                if (tt.use_letters) {
                    string_command += ", use.letters = TRUE";
                }
                
                if (tt.PRI) {
                    string_command += ", PRI = TRUE";
                }
                
                string_command += ")";
                
            }
            
            
            
            
            if (type == "calibrate") {
                
                var col = (getKeys(colclicks).indexOf("calibrate") >= 0)?getTrueKeys(colclicks.calibrate.x):"";
                
                if (col.length > 0) { // in fact equal to exactly 1
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
                    
                    if (calibrate.p != "1") {
                        string_command += ", p = " + calibrate.p;
                    }
                    
                    if (calibrate.q != "1") {
                        string_command += ", q = " + calibrate.q;
                    }
                    
                    string_command += ")";
                    
                }
                else {
                    string_command = "";
                }
            }
            
            if (type == "recode") {
                
                var col = (getKeys(colclicks).indexOf("recode") >= 0)?getTrueKeys(colclicks.recode.x):"";
                
                var uniques = getUniqueNewv(recode.newv);
                
                
                if (col.length > 0 && uniques.length > 0) {
                    
                    if (!recode.same && recode.newvar != "") {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + recode.newvar;
                    }
                    else {
                        string_command = ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col;
                    }
                    
                    string_command += " <- recode(" + ((read_table.filename != "")?read_table.filename:imported_filename) + "$" + col + ", \"";
                    
                    var nl = recode.newv.length; // length for the new values 
                    var temp, oldvals;
                    for (var i = 0; i < uniques.length; i++) {
                        temp = new Array();
                        oldvals = "";
                        // identify oldv with the same newv
                        
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





/* --------------------------------------------------------------------- */





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
        // selection can be one of "none", "single", "multiple"
        
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
                if (datainfo.rownames != "") { // which means a valid datafile has been read
                
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
                            else { // simple click, without Shift
                                
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
                                        thinfo[1] = this.name;
                                        
                                        for (var i = 0; i < calibrate.thresholds.length; i++) {
                                            ths[i].attr({"text": ""});
                                            calibrate.thresholds[i] = "";
                                        }
                                        
                                        if (calibrate.findth) {
                                            updatecounter = 0;
                                            thvalsfromR[0] = "noresponse";
                                            thinfo[2] = 1 - thinfo[2];
                                            Shiny.onInputChange("thinfo", thinfo);
                                            updateWhenThsChanged();
                                            
                                        }
                                        else if (calibrate.type == "crisp") {
                                            
                                            updatecounter = 0;
                                            thsetter2R.counter += 1;
                                            thsetter2R.cond = this.name;
                                            
                                            if (lastvals == thsetter_vals) {
                                                drawPointsAndThresholds();
                                            }
                                            else {
                                            
                                                Shiny.onInputChange("thsetter2R", thsetter2R);
                                                
                                                doWhenDataPointsAreReturned();
                                            }
                                        }
                                        
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




/* --------------------------------------------------------------------- */





// a (pseudo)equivalent strwrap() function in R
// modified version of http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
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
            //try again, this time from the beginning
            //maybe this is a very long string without many spaces or break characters
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





/* --------------------------------------------------------------------- */





function getTextWidth(string) {
    var paper = Raphael(0, 0, 0, 0);
        paper.canvas.style.visibility = "hidden";
    
    var BBox = sat(paper.text(0, 0, string)).getBBox();
    
    paper.remove();
    return BBox.width;
}





/* --------------------------------------------------------------------- */





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





/* --------------------------------------------------------------------- */





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


    


/* --------------------------------------------------------------------- */





function update_data() {
    
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
    
    for (var i = Xshift - 25; i < Xshift + 60; i++) { // 25 columns leftside and another 35 in the rightside (about 10 are already visible)
        // vertical grid
        bodygridtext += "M" + 70*i + "," + 20*(Yshift - 50) + "L" + 70*i + "," + 20*(Yshift + 120);
        colgridtext += "M" + 70*i + ",0 L" + 70*i + ",20";
        //papers["data_colnames"].path("M" + 70*i + ",0 L" + 70*i + ",20").attr({stroke: "#d7d7d7"});
    }
    
    
    for (var i = Yshift - 50; i < Yshift + 120; i++) { // 50 rows above and another 50 below (about 20 are already visible)
        // horizontal grid
        bodygridtext += "M" + 70*(Xshift - 25) + "," + 20*i + "L" + 70*(Xshift + 60) + "," + 20*i;
        papers["data_rownames"].path("M" + 0 + "," + 20*i + "L 70" + "," + 20*i).attr({stroke: "#d7d7d7"});
    }
    
    // gridset is a global... why?
    gridset = papers["data_body"].path(bodygridtext).attr({stroke: "#d7d7d7"});
    papers["data_colnames"].path(colgridtext).attr({stroke: "#d7d7d7"});
    
    
    
    var getCoords = function(event) {
        // event.clientX si event.clientY sunt coordonatele mouse-ului in total fereastra
        // testX si testY reprezinta coordonatele dialogului in total fereastra
        
        var scrollX = $("#data_body").scrollLeft()%70;
        var scrollY = $("#data_body").scrollTop()%20;
        
        // 70 is the width of the columns
        // 20 is the height of the rows
        // 40 is 20px the header and 20px the column names
        
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
        
        for (var j = 0; j < scrollvh[2] + 1; j++) { // horizontal grids
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
                70*coords.mouseX - coords.scrollX + 70, // 70 width of the rownames
                20 - 1*(navigator.browserType == "Firefox"), // height of the header
                70, //Math.max(70, getTextWidth("" + temp) + 20),
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
                    
                    dataModif = ["c", coords.mouseX + coords.Xshift + 1, ((isNaN(tocompare*1))?tocompare:(tocompare*1))];
                    Shiny.onInputChange("dataModif", dataModif);
                    
                    refresh_cols("exclude", "import");
                    //filldirexp();
                    
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
                    
                    // cover the old text (can't replace it because it's not stored anywhere
                    papers["data_colnames"].rect(70*(coords.mouseX + coords.Xshift), 0, 70, 20)
                    .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
                    
                    // print the new text
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
        //
        
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
                20*coords.mouseY - coords.scrollY + 20 + 20 - 1*(navigator.browserType == "Firefox"), // 20 header height, 20 colnames height
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
                    
                    dataModif = ["r", coords.mouseY + coords.Yshift + 1, ((isNaN(tocompare*1))?tocompare:(tocompare*1))];
                    Shiny.onInputChange("dataModif", dataModif);
                    
                    if ($("#xyplot").length) {
                        if (xyplotdata.length > 0) {
                            xyplotdata[0][xyplotdata[0].indexOf(temp)] = tocompare;
                            draw_xyplot(papers["xyplot_main"]);
                        }
                    }
                    
                    // cover the old text (can't replace it because it's not stored anywhere
                    papers["data_rownames"].rect(0, 20*(coords.mouseY + coords.Yshift), 70, 20)
                    .attr({fill: "#f2f2f2", stroke: "#d7d7d7"});
                    
                    // print the new text
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
                70*coords.mouseX - coords.scrollX + 70 + 1, // 70 width of the rownames
                20*coords.mouseY - coords.scrollY + 20 + 20 + 1 - 1*(navigator.browserType == "Firefox"), // 20 header height, 20 colnames height
                70, //Math.max(70, getTextWidth("" + temp) + 20) - 2, 
                20 - 2);
            
            input.addEventListener("blur", function(e) {
                tobe.inlineTextEditing.stopEditing(tasta);
                tocompare = tobe.attr("text");
                
                if (temp != tocompare) {
                    
                    theData[coords.mX][coords.mY] = tocompare;
                    
                    if (!isNaN(tocompare)) {
                        tocompare = 1*tocompare
                    }
                    
                    dataModif = [coords.mouseY + coords.Yshift + 1, coords.mouseX + coords.Xshift + 1, tocompare];
                    Shiny.onInputChange("dataModif", dataModif);
                    
                    //temprect = 
                    papers["data_body"].rect(70*(coords.mouseX + coords.Xshift), 20*(coords.mouseY + coords.Yshift), 70, 20)
                    .attr({fill: "#ffffff", stroke: "none"});
                    
                    sat(papers["data_body"].text(5 + 70*(coords.mouseX + coords.Xshift), 10 + 20*(coords.mouseY + coords.Yshift), tocompare));
                    
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





/* --------------------------------------------------------------------- */





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
            // reset the default
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
    
    
    
    //sat(paper.text(stx + 285, sty + 15, "Choose file or set working directory:"));
    sat(paper.text(stx + 251, sty + 15, "Directory:"));
    paper.stdir_text = sat(paper.text(stx + 320, sty + 15, read_table.row_names),
                        {"clip": (stx + 315) + ", " + (sty + 5) + ", 337, 20"});
    
    paper.inlineTextEditing(paper.stdir_text);
    var stdir_rect = paper.rect(stx + 315, sty + 5, 337, 20)
        .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
        .click(function(e) {
            //var me = this;
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
                var header = strwrap(string_command, 74, "+ ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#result_main").append("<span style='color:blue'>" + header + "</span><br><br>");
                $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
                
                
                function littleWait() {
                    updatecounter += 1;
                    
                    if (updatecounter < 101) { // 10 seconds
                        
                        if (datainfo.nrows > 0) {
                            
                            colclicks = new Array();
                            refresh_cols("all");
                            filldirexp();
                            
                            if (thsetter_vals.length > 0) {
                                drawPointsAndThresholds();
                            }
                            
                            if ($("#data_editor").length) {
                                scrollvh = [0, 0, 16, 7];
                                $("#data_body").scrollTop(0);
                                $("#data_body").scrollLeft(0);
                                print_data();
                            }
                            
                            imported_filename = dirfile.filename;
                            
                            $("#import").hide();
                            
                            // refresh the export dialog
                            draw_export(papers["export_main"]);
                            
                            
                            updatecounter = 0; // don't erase!
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
                var header = strwrap(string_command, 74, "+ ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#result_main").append("<span style='color:blue'>" + header + "</span><br><br>");
                $("#result_main").append("<span style='color:red'>Error: this is not a valid dataset.</span><br><br>");
                $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
                
                
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
            // reset the default
            tasta = "enter";
        }, true);
    });
    
    fnameset.push(fnametext, fname_rect);
    fnameset.hide();
    
    
    dirsfilescopy = "";
            
    if (dirfile.dirs != null) {
        for (var i = 0; i < dirfile.dirs.length; i++) {
            dirsfilescopy += dirfile.dirs[i];
        }
    }
    
    if (dirfile.files != null) {
        for (var i = 0; i < dirfile.files.length; i++) {
            dirsfilescopy += dirfile.files[i];
        }
    }
    
    
    dirfilevisit = true;
    print_dirs();
    
    // test again if the list of files/dirs changed
    dirfilist.value = 1 - dirfilist.value;
    Shiny.onInputChange("dirfilist", dirfilist);
    printIfDirsFilesChange();
}





/* --------------------------------------------------------------------- */





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
                
                // reset the default
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
                
                // reset the default
                tasta = "enter";
            }, true);
        });
        
        caseidset.push(caseid, caseid_rect);
        
        
        sat(paper.text(stx + 5, sty + 317, "New file:"));
        
        if (exportobj.filename == "") {
            exportobj.filename = ((read_table.filename != "")?read_table.filename:imported_filename);
        }
        
        
        exportobj.filename = ((read_table.filename != "")?read_table.filename:imported_filename) + "." + dirfile.extension;
        
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
                
                // reset the default
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
            .click(function() {
                console_command("export");
                
                var cr = {"£": "csv(", "§": "table(", "∞":" ", "≠": " "};
                var header = strwrap(string_command, 74, "+ ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
                
                $("#result_main").append("<span style='color:blue'>" + header + "</span><br><br>");
                $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
                
                
                exportobj.counter += 1;
                Shiny.onInputChange("exportobj", exportobj);
                
                $("#export").hide();
            })
        
        
        dirsfilescopy = "";
                
        if (dirfile.dirs != null) {
            for (var i = 0; i < dirfile.dirs.length; i++) {
                dirsfilescopy += dirfile.dirs[i];
            }
        }
        
        if (dirfile.files != null) {
            for (var i = 0; i < dirfile.files.length; i++) {
                dirsfilescopy += dirfile.files[i];
            }
        }
        
        
        dirfilevisit = true;
        print_dirs();
        
        // test again if the list of files/dirs changed
        dirfilist.value = 1 - dirfilist.value;
        Shiny.onInputChange("dirfilist", dirfilist);
        printIfDirsFilesChange();
        
    }

}






/* --------------------------------------------------------------------- */





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
                                "selectable": ["all"] // irrelevant here
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





/* --------------------------------------------------------------------- */





function draw_calib(paper) {
if ($("#calibrate").length) {
    
    paper.clear();
    
    
    var thlabelsfuz = ["exclusion", "crossover", "inclusion"];
    var thlabelscrp = ["th1", "th2", "th3"]
    var thlabels = new Array(6);
    var thcovers = new Array(6);
    var increasing = false;
    
    paper.thsetter_frame = paper.rect(152, 168.5, 320, 90).attr({stroke: "#d0d0d0"});
                                         // was 295
    
    sat(paper.text(18, 24, "Choose condition:"));
    
    var stx = 153, sty = 27;
    
    
    // radio crisp vs. fuzzy
    
    var crfuz = paper.radio(stx + 15, sty, 1*(calibrate.type == "fuzzy"), ["crisp", "fuzzy"]);
    
    // crisp radio button
    crfuz.cover[0].click(function() {
        
        changeLabels();
        
        calibrate.thresholds = new Array(thinfo[0]);
        calibrate.thnames = new Array(thinfo[0]);
        
        //save what was there from the fuzzy option
        calibrate.thscopyfuz = new Array(6);
        for (var i = 0; i < 6; i++) {
            calibrate.thscopyfuz[i] = ths[i].attr("text");
            if (i > 0) {
                thsets[i].hide();
            }
            
        }
        
        //write what was (previously) saved as crisp
        for (var i = 0; i < 3; i++) {
            ths[i].attr({"text": calibrate.thscopycrp[i]});
            if (i < thinfo[0]) {
                calibrate.thresholds[i] = calibrate.thscopycrp[i];
                calibrate.thnames[i] = "t" + i;
            }
        }
        
        showCrisp();
        
        calibrate.type = "crisp";
        console_command("calibrate");
        
    });
    
    
    // fuzzy radio button
    crfuz.cover[1].click(function() {
        
        changeLabels();
        
        calibrate.thresholds = new Array();
        calibrate.thnames = new Array();
        
        //save what was there from the crisp option
        for (var i = 0; i < 3; i++) {
            calibrate.thscopycrp[i] = ths[i].attr("text");
        }
        
        //write what was previously saved as fuzzy
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
    
    
    
    // when crisp
    
    
    var thinfoset = paper.set();
    
    
    var thinfotext = sat(paper.text(stx + 145, sty, "Number of thresholds: 1"));
    thinfoset.push(thinfotext);
    
    // the plus and minus signes
    thinfoset.push(paper.rect(stx + 308.5, sty - 8, 1, 6));
    thinfoset.push(paper.rect(stx + 306, sty - 5.5, 6, 1));
    thinfoset.push(paper.rect(stx + 306, sty + 8.5, 6, 1));
    
    var plus = sat(paper.rect(stx + 303, sty - 11, 12, 12));
    var minus = sat(paper.rect(stx + 303, sty + 3, 12, 12));
    thinfoset.push(plus, minus);
    
    plus.click(function() {
        thinfo[0] += 1;
        if (thinfo[0] > 3) {
            thinfo[0] = 3;
        }
        
        calibrate.thresholds = new Array(thinfo[0]);
        calibrate.thnames = new Array(thinfo[0]);
        for (var i = 0; i < thinfo[0]; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i);
        }
        
        showths();
        console_command("calibrate");
        
        if (findth.isChecked) {
            thvalsfromR[0] = "noresponse";
            updatecounter = 0;
            Shiny.onInputChange("thinfo", thinfo);
            updateWhenThsChanged();
        }
        else if (thsetter_vals.length > 0) {
            drawPointsAndThresholds();
        }
    });
    
    minus.click(function() {
        thinfo[0] -= 1;
        if (thinfo[0] < 1) {
            thinfo[0] = 1;
        }
        
        calibrate.thresholds = new Array(thinfo[0]);
        calibrate.thnames = new Array(thinfo[0]);
        for (var i = 0; i < thinfo[0]; i++) {
            calibrate.thresholds[i] = ths[i].attr("text");
            calibrate.thnames[i] = thlabels.sub(i);
        }
        
        showths();
        console_command("calibrate");
        
        if (findth.isChecked) {
            thvalsfromR[0] = "noresponse";
            updatecounter = 0;
            Shiny.onInputChange("thinfo", thinfo);
            updateWhenThsChanged();
        }
        else if (thsetter_vals.length > 0) {
            drawPointsAndThresholds();
        }
    });
    
    
    function showths() {
        thinfotext.attr({"text": ("Number of thresholds: " + thinfo[0])});
        for (var i = 1; i < 3; i++) {
            if (i < thinfo[0]) {
                thsets[i].show();
            }
            else {
                //ths[i].attr({"text": ""})
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
        
        if (getKeys(colclicks).indexOf("calibrate") >= 0) {
            calibrate.x[0] = getTrueKeys(colclicks.calibrate.x);
            
            if (calibrate.findth && calibrate.x[0].length > 0) {
                thinfo[2] = 1 - thinfo[2]; // to produce a change, similar to counter in other objects that communicate with R
                thvalsfromR = ["noresponse"];
                updatecounter = 0;
                
                Shiny.onInputChange("thinfo", thinfo);
                updateWhenThsChanged();
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
    
    
    
    // when fuzzy
    
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
    
    
    // radio increasing vs. decreasing
    
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
    
    
    // radio end-point vs. mid-point
    
    var endmid = paper.radio(stx + 15, sty + 195, 1 - calibrate.end, ["end-point", "mid-point"]);
    
    endmid.cover[0].click(function() {
        copyThs.show();
        copytext2.hide();
        calibrate.end = true;
        
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
        
        logistic.uncheck();
        calibrate.logistic = false;
        idm.hide();
        ecdf.uncheck();
        calibrate.ecdf = false;
        
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
        
        if (crfuz.whichChecked == 0) { // crisp
            for (var i = 0; i < 3; i++) {
                thlabels[i].attr({"text": thlabelscrp[i]});
            }
            
        }
        else { //fuzzy
            incdec.label[0].attr({"text": (endmid.whichChecked == 0)?"increasing":"incr \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 decr"});
            incdec.label[1].attr({"text": (endmid.whichChecked == 0)?"decreasing":"decr \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 incr"});
            
            for (var i = 0; i < 6; i++) {
                if (incdec.whichChecked == 0) { // increasing
                    thlabels[i].attr({"text": thlabelsfuz[(i < 3)?(i):(5 - i)] + ((endmid.whichChecked == 0)?"":((i < 3)?1:2))});
                }
                else { // decreasing
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
    sty = 50;
    
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
                    if ($.isNumeric(finaltext)) { // isNumeric() ...?
                        finaltext = 1*finaltext;
                        
                        
                        // the thresholds setter cannot be less than the minima of the data values
                        if (thsetter_vals.length > 0) {
                            if (finaltext < thsetter_vals[0][0]) {
                                finaltext = "" + thsetter_vals[0][0];
                            }
                            
                            if (finaltext > thsetter_vals[thsetter_vals.length - 1][0]) {
                                finaltext = "" + thsetter_vals[thsetter_vals.length - 1][0];
                            }
                        }
                    }
                    else {
                        finaltext = "";
                    }
                    
                    ths[this.i].attr({"text": finaltext});
                    
                    calibrate.thresholds[this.i] = finaltext;
                    
                    if (crfuz.whichChecked == 0) { // crisp
                        calibrate.thscopycrp[this.i] = finaltext;
                        drawPointsAndThresholds();
                    }
                    else { // fuzzy
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
    
    // reset for the first label, crisp
    thlabels[0].attr({"text": thlabelscrp[0]});
    
    thlabels.sub = function(x) {
        return(thlabels[x].attr("text").substring(0, 1))
    }
    
    var pqset = paper.set();
    pqset.push(sat(paper.text(stx, sty + 175, "p"), {"anchor": "end"}));
    pqset.push(sat(paper.text(stx, sty + 200, "q"), {"anchor": "end"}));
    
    var pvalue = sat(paper.text(stx + 23, sty + 175, "1"), {"anchor": "end"});
    var qvalue = sat(paper.text(stx + 23, sty + 200, "1"), {"anchor": "end"});
    pqset.push(pvalue, qvalue);
    
    pqset.push(sat(paper.rect(stx + 10, sty + 165, 50, 20, 3))
        .click(function(e) {
            e.stopPropagation();
            var me = this;
            var BBox = this.getBBox();
            input = pvalue.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                pvalue.inlineTextEditing.stopEditing(tasta);
                calibrate.p = pvalue.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(pvalue);
    
    
    pqset.push(sat(paper.rect(stx + 10, sty + 190, 50, 20, 3))
        .click(function(e) {
            var me = this;
            e.stopPropagation();
            var BBox = this.getBBox();
            input = qvalue.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
            input.addEventListener("blur", function(e) {
                qvalue.inlineTextEditing.stopEditing(tasta);
                calibrate.q = qvalue.attr("text");
                me.toFront();
                tasta = "enter";
                console_command("calibrate");
            });
        }));
    paper.inlineTextEditing(qvalue);
    
    
    
    copyThs = paper.set();
    copytext1 = sat(paper.text(stx - 46, sty + 90, "Copy from crisp"));
    copytext2 = sat(paper.text(stx - 47, sty + 90, "Copy from fuzzy"));
    cFCrect = paper.rect(stx - 54, sty + 100 - 23, 115, 25).attr({fill: "white", "fill-opacity": 0, 'stroke-width': 0.75})
         .click(function() {
             
             for (var i = 0; i < 3; i++) {
                 if (crfuz.whichChecked == 0) {
                     // copy from fuzzy
                     calibrate.thscopycrp[i] = calibrate.thscopyfuz[i];
                     ths[i].attr({"text": calibrate.thscopyfuz[i]});
                     
                     if (i < thinfo[0]) {
                         calibrate.thresholds[i] = calibrate.thscopyfuz[i];
                     }
                 }
                 else {
                     // copy from crisp
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
        
        pqset.hide();
        incdecshape3.hide();
        incdecshape6.hide();
        
        copyThs.show();
        copytext1.hide();
        copytext2.show();
        
        
        showths();
        
        changeLabels();
        
        
    }
    
    function showFuzzy() {
        thsetter_content.hide();
        inclth.hideIt();
        logistic.showIt();
        incdec.showIt();
        endmid.showIt();
        findth.hideIt();
        thinfoset.hide();
        paper.thsetter_frame.hide();
        ecdf.showIt();
        
        if (logistic.isChecked) {
            idm.show();
        }
        else {
            idm.hide();
        }
        
        
        thtitle.show();
        //th0set is shown by default for both crisp and fuzzy
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
        
        pqset.show();
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
    
    // not necessary, but I need to split the label on two rows
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
    paper.Run.push(sat(paper.text(423, sty + 25, "Run")));
    paper.Run.push(paper.rect(421 - 20, sty + 12, 70, 25)
    .attr({fill: "white", "fill-opacity": 0, 'stroke-width': 1.25})
    .click(function() {
        if (datainfo.rownames != "") {
            var fuzcheck = true;
            
            if (calibrate.type == "fuzzy") {
                if (calibrate.logistic) {
                    // idm needs to exist
                    if (calibrate.idm == "") {
                        fuzcheck = false;
                    }
                    else {
                        //and it should be a number
                        fuzcheck = fuzcheck && !isNaN(calibrate.idm);
                    }
                }
                
                // both p and q need to exist
                if (calibrate.p == "" || calibrate.q == "") {
                    fuzcheck = false;
                }
                else {
                    // and they should be numbers
                    fuzcheck = fuzcheck && !isNaN(calibrate.p) && !isNaN(calibrate.q)
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
    
    
    
} // end of if dialog open
} // end of draw_calib





/* --------------------------------------------------------------------- */





function draw_recode(paper) {
if ($("#recode").length) {
    
    paper.clear();
    paper.rules = new Array();
    paper.rules["oldv"] = "";
    paper.rules["newv"] = "";
    
    var stx = 13, sty = 10;
    
    sat(paper.text(stx + 5, sty + 14, "Choose condition:"), {"text": 0});
    
    
    paper.newcond = paper.checkBox(stx + 3, sty + 250, !recode.same, "into new condition");
    
    // not necessary, but I need to split the label on two rows
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
    //
    paper.oldradio.cover[0].click(function() {
        paper.rules.oldv = paper.oldv.texts.VALUE.attr("text");
    });
    
    paper.oldradio.cover[1].click(function() {
        paper.rules.oldv[0] = paper.oldv.texts.FROM.attr("text");
        paper.rules.oldv[1] = paper.oldv.texts.TO.attr("text");
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
    
    
    
    // pseudo CSS for these objects, setting various attributes
    sat(paper.oldv.texts, {"clip": paper.oldv.covers});
    sat(paper.oldv.covers);
    
    
    paper.path([ // dividing line between old and new values
        ["M", stx + 140, sty + 15],
        ["L", stx + 140, sty + 215]
    ]).attr({stroke: "#a0a0a0"});
    
    
    paper.newradio = paper.radio(stx + 180, sty + vertspace, -1, [
            "value",
            "missing",
            "copy old values"
            ], vertspace-10);
    //
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
    
    
    
    // plus sign
    paper.rect(stx + 159.5, sty + 151, 1, 6);
    paper.rect(stx + 157, sty + 153.5, 6, 1);
    // minus sign
    paper.rect(stx + 157, sty + 173.5, 6, 1);
    
    sat(paper.rect(stx + 153, sty + 147, 14, 14), {"sw": 1.2}) // plus sign "+" cover
    .click(function() {
        
        var rule;
        
        if (all(paper.rules.oldv, " != \"\"") && paper.rules.newv != "") {
            
            if (paper.oldradio.whichChecked == 1) { // from - to
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
    
    sat(paper.rect(stx + 153, sty + 167, 14, 14), {"sw": 1.2}) // minus sign "-" cover
    .click(function() {
            
        var selected = getTrueKeys(colclicks.recode.rules);
        
        for (var i = 0; i < selected.length; i++) {
            var idx = recode.oldv.indexOf(selected[i].split("=")[0]);
            recode.oldv.splice(idx, 1);
            recode.newv.splice(idx, 1);
            //delete colclicks.recode.rules[selected[i]];
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
      
} // end of if recode opened
} // end of draw_recode





/* --------------------------------------------------------------------- */





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
    
    sat(paper.text(stx, sty + 14, "Outcome:"));
    sat(paper.text(stx, sty + 170, "Condition:"));
    
    paper.scale = scale;
    paper.sx = 230;
    paper.sy = 20;
    paper.dim = 480; // dimension for the plotting square
    paper.offset = 8;
    paper.rdim = paper.dim - 2*paper.offset;
    
    paper.negy = paper.checkBox(stx + 79, sty + 9, xyplot.negy, "negate");
    paper.negx = paper.checkBox(stx + 79, sty + 165, xyplot.negx, "negate");
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
            paper.PRI.attr({"text": ("PRI: " + xyplotdata[4][paper.index][2])});
            paper.ron.attr({"text": ("Relevance: " + xyplotdata[4][paper.index][3])});
            paper.measures.show();
        }
    });
    
    
    paper.measures = paper.set();
    paper.incl = sat(paper.text(paper.sx + 2, 10, "Inclusion: "));
    paper.cov = sat(paper.text(paper.sx + 122, 10, "Coverage: "));
    paper.PRI = sat(paper.text(paper.sx + 250, 10, "PRI: "));
    paper.ron = sat(paper.text(paper.sx + 345, 10, "Relevance: "));
    
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
    paper.th.min = 0; // degrees
    paper.th.max = 45; // degrees
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
    
} // end of xyplot isOpen
} // end of draw_xyplot





/* --------------------------------------------------------------------- */





function draw_venn(paper) {
    
    // raphael.boolean.js
    // union [A + B | A OR B]
    // difference [A - B | A NOT B]
    // intersection [A * B | A AND B]
    // exclusion [A ^ B = (A + B) - (A * B) | A XOR B]
    
    var glow, txt, txtfundal;
    
            
    function hoverInVenn() {
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
    
    function hoverOutVenn() {
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
                "0": "#ffd885", // orange
                "1": "#96bc72", // green
                "C": "#1c8ac9", // blueish
                "?": "white"
            };
            
            if (paper.scale === undefined) {
                paper.scale = (Math.min($(paper.canvas).width() - 20, $(paper.canvas).height() - 70))/400;;
            }
            
            if (paper.customtext === undefined) {
                paper.customtext = "";
            }
            
            if (paper.custom === undefined) {
                paper.custom = false;
            }
            
            paper.clear();
            
            var vennumber = ttfromR.options.conditions.length;
            
            
            var tosplit, BBox, BBox2, inIndexes;
            var allshapes = paper.set();
            var boxset = paper.set();
            
            var vennset = paper.set();
            
            var temp = paper.rect(0, 0, 400*paper.scale, 400*paper.scale);
            
            vennset.push(temp);
            allshapes.push(temp);
            
            // draw the actual whole sets, no fill
            for (var i = 0; i < vennumber; i++) {
                var temp = paper.path(scaleShape(venn["s" + vennumber][i], paper.scale));
                vennset.push(temp);
                allshapes.push(temp);
                
            }
            
            var setLabelsGroup = paper.set();
            
            for (var i = 0; i < vennumber; i++) {
                var templabel = sat(paper.text(venn[("l" + vennumber)].x[i]*paper.scale, venn[("l" + vennumber)].y[i]*paper.scale, ttfromR.options.conditions[i]), {anchor: "middle"});
                setLabelsGroup.push(templabel);
                allshapes.push(templabel);
            }
            
            var labelsGroup = paper.set();
            var hoverGroup = paper.set();
            var colored = paper.set();
            var customeSet = paper.set();
            
            // draw all intersections which have colors
            for (var i = 0; i < ttfromR.id.length; i++) {
                var temp = paper.path(scaleShape(venn["c" + vennumber][i], paper.scale))
                                .attr({fill: vcolors[ttfromR.tt.OUT[i]], stroke: "none"});
                BBox = temp.getBBox();
                
                var centroid = getCentroid(temp);
                
                var templabel;
                if (i == 0) {
                    templabel = sat(paper.text(20, 16, ttfromR.id[i]), {size: 8, anchor: "middle"});
                }
                else {
                    templabel = sat(paper.text(centroid.x, centroid.y, ttfromR.id[i]), {size: 8, anchor: "middle"});
                }
                
                labelsGroup.push(templabel);
                allshapes.push(templabel);
                
                if (ttfromR.cases[i] != "") {
                    var hoverPath = temp.clone().attr({fill: "#fff", "fill-opacity": 0, stroke: "none"});
                    hoverGroup.push(hoverPath);
                    hoverPath.txt = ttfromR.cases[i];
                    hoverPath.hover(hoverInVenn, hoverOutVenn, hoverPath, hoverPath);
                    colored.push(temp, hoverPath)
                    allshapes.push(temp, hoverPath);
                }
                else {
                    temp.remove();
                }
            }
            
            
            BBox = allshapes.getBBox();
            allshapes.transform("t10, 35");
             
            BBox = allshapes.getBBox();
            
            
            // draw the legend
            var colorsCols = getKeys(vcolors);
            for (var i = 0; i < colorsCols.length; i++) {
                paper.rect(BBox.x + 50*i, BBox.y + BBox.height + 12, 11, 11)
                    .attr({fill: vcolors[colorsCols[i]]});
                sat(paper.text(BBox.x + 50*i + 18, BBox.y + BBox.height + 18, colorsCols[i]));
            }
            
            
            var rule = paper.set();
            var customSet = paper.set();
            var customHover = paper.set();
            var glow;
            
            var custom = paper.checkBox(10, 10, paper.custom, "custom");
            
            custom.cover.click(function() {
                if (custom.isChecked) {
                    paper.custom = true;
                    colored.hide();
                    rule.show();
                    customSet.show();
                    if (glow !== undefined) {
                        glow.show();
                    }
                }
                else {
                    paper.custom = false;
                    colored.show();
                    rule.hide();
                    customSet.hide();
                    if (glow !== undefined) {
                        glow.hide();
                    }
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
                    for (var i = 0; i < cols.length; i++) {
                        var temp = paper.path(scaleShape(customShape(parsedText[cols[i]], venn["s" + vennumber], paper), paper.scale))
                                        .attr({fill: vcolors["1"], stroke: "none"});
                        
                        var hover = temp.clone().attr({fill: "#fff", "fill-opacity": 0, stroke: "none"});
                        hover.txt = cols[i];
                        hover.hover(hoverInVenn, hoverOutVenn, hover, hover);
                        customHover.push(hover);
                        customSet.push(temp, hover);
                    }
                    
                    customSet.transform("t10, 35");
                    
                    setLabelsGroup.toFront();
                    labelsGroup.toFront();
                    vennset.toFront();
                    customHover.toFront();
                    hoverGroup.toFront();
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
                        customSet = paper.set();
                        
                        if (glow !== undefined) {
                            glow.remove();
                        }
                        
                        if (ruletext.attr("text") != "") {
                            var parsedText = parseText(paper.customtext, ttfromR.options.conditions);
                            if (parsedText != "error") {
                                
                                var cols = getKeys(parsedText);
                                for (var i = 0; i < cols.length; i++) {
                                    var temp = paper.path(scaleShape(customShape(parsedText[cols[i]], venn["s" + vennumber], paper), paper.scale))
                                                    .attr({fill: vcolors["1"], stroke: "none"});
                                    var hover = temp.clone().attr({fill: "#fff", "fill-opacity": 0, stroke: "none"});
                                    hover.txt = cols[i];
                                    hover.hover(hoverInVenn, hoverOutVenn, hover, hover);
                                    customHover.push(hover);
                                    customSet.push(temp, hover);
                                }
                                
                                customSet.transform("t10,35");
                                
                                setLabelsGroup.toFront();
                                labelsGroup.toFront();
                                vennset.toFront();
                                customHover.toFront();
                                hoverGroup.toFront();
                            }
                            else {
                                glow = rulerect.glow({
                                    color: "#ff0000",
                                    width: 4
                                });
                            }
                        }
                    }
                    me.toFront();
                    tasta = "enter";
                })
            });
            
            
            paper.inlineTextEditing(ruletext);
            
            
            if (paper.custom) {
                colored.hide();
                customSet.show();
                if (glow !== undefined) {
                    glow.show();
                }
            }
            else {
                rule.hide();
                customSet.hide();
                if (glow !== undefined) {
                    glow.hide();
                }
            }
            
            setLabelsGroup.toFront();
            labelsGroup.toFront();
            vennset.toFront();
            customHover.toFront(); // if one of them is hidden, it doesn't matter
            hoverGroup.toFront();
            
        } // end of checking if a truth table exists
    } // end of $("#venn").length
} // end of draw_venn





/* --------------------------------------------------------------------- */





function draw_tt(paper) {
    
    if ($("#tt").length) {
    
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
        
        // border for the sorting options
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
            // the click event is trigerred by dragSortStop();
            
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
        
        
        var ctx = 396; // x coordinate for the cutoff
        var cty = 180; // y coordinate for the cutoff
        
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
        var inclcut1 = paper.text(ctx + 5, cty + 50, tt.incl_cut1).attr({"text-anchor": "start", "font-size": "14px"});
        paper.rect(ctx, cty + 40, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut1.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut1.inlineTextEditing.stopEditing(tasta);
                    tt.incl_cut1 = inclcut1.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("tt");
                });
            });
        paper.inlineTextEditing(inclcut1);
        
        paper.text(ctx - 15, cty + 75, "Inclusion 0").attr({"text-anchor": "end", "font-size": "14px"});
        var inclcut0 = paper.text(ctx + 5, cty + 75, tt.incl_cut0).attr({"text-anchor": "start", "font-size": "14px"});
        paper.rect(ctx, cty + 65, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut0.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut0.inlineTextEditing.stopEditing(tasta);
                    tt.incl_cut0 = inclcut0.attr("text");
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
                
                // this is important, for example if the user modifies a data cell
                // and re-runs the eqmcc function without changing any other option
                tt2R.counter += 1;
                
                outres[0] = "listen2R";
                
                Shiny.onInputChange("tt2R", tt2R);
                updatecounter = 0;
                printWhenOutputChanges()
            }
        });
        
    }
}





/* --------------------------------------------------------------------- */





function draw_eqmcc(paper) {
    
    if ($("#eqmcc").length) {
        paper.clear();
    
        sat(paper.text(14, 18, "Outcome:"));
        sat(paper.text(234, 18, "Conditions:"));
        sat(paper.text(18, 283, "Directional exps:"));
        
        
        
        var expx = 17;
        var expy = 172;
        
        
        sat(paper.text(expx, expy, "Explain:"));
        paper.rect(expx + 3.5, expy + 11, 38, 82)
                   .attr({stroke: '#d0d0d0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0});
        //
        sat(paper.text(expx + 61, expy, "Include:"));
        paper.rect(expx + 65.5, expy + 11, 38, 82)
                   .attr({stroke: '#d0d0d0', 'stroke-width': 1, fill: "#ffffff", "fill-opacity": 0});
        //
        
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
                        if (this.id < 4) { // explain
                            var index = eqmcc.explain.indexOf(value);
                            if (index > -1) {
                                eqmcc.explain.splice(index, 1);
                            }
                            else {
                                eqmcc.explain.push(value);
                            }
                        }
                        else { //include
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
        var inclcut1 = sat(paper.text(expx + 385, expy + 140 + 5, eqmcc.incl_cut1));
        paper.rect(expx + 380, expy + 130 + 5, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut1.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut1.inlineTextEditing.stopEditing(tasta);
                    eqmcc.incl_cut1 = inclcut1.attr("text");
                    me.toFront();
                    tasta = "enter";
                    console_command("eqmcc");
                });
            });
        paper.inlineTextEditing(inclcut1);
        
        sat(paper.text(expx + 365, expy + 125 + 40 + 5, "Inclusion 0"), {anchor: "end"});
        var inclcut0 = sat(paper.text(expx + 385, expy + 125 + 40 + 5, eqmcc.incl_cut0));
        paper.rect(expx + 380, expy + 115 + 40 + 5, 50, 20, 3)
            .attr({fill: "#ffffff", stroke: "#a0a0a0", "fill-opacity": "0"})
            .click(function(e) {
                e.stopPropagation();
                var me = this;
                var BBox = this.getBBox();
                input = inclcut0.inlineTextEditing.startEditing(BBox.x + 1, BBox.y + 21 - 1*(navigator.browserType == "Firefox"), BBox.width - 2, BBox.height - 2);
                input.addEventListener("blur", function(e) {
                    inclcut0.inlineTextEditing.stopEditing(tasta);
                    eqmcc.incl_cut0 = inclcut0.attr("text");
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
                
                // this is important, for example if the user modifies a data cell
                // and re-runs the eqmcc function without changing any other option
                eqmcc2R.counter += 1;
                
                outres[0] = "listen2R";
                
                Shiny.onInputChange("eqmcc2R", eqmcc2R);
                updatecounter = 0;
                printWhenOutputChanges();
            }
        });
        
        
    }
}





/* --------------------------------------------------------------------- */





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
            
            var conds = eqmcc.conditions;
            
            if (conds.length == 0) {
                if (singleoutcome) {
                    var colnames = new Array(datainfo.colnames.length);
                    
                    for (var i = 0; i < datainfo.colnames.length; i++) {
                        colnames[i] = datainfo.colnames[i];
                    }
                    
                    var index = colnames.indexOf(eqmcc.outcome[0]);
                    if (index >= 0) { // just in case
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
                // de verificat lungimea numelor de coloane
                
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
                        
                        // var tocompare = celltext[this.pos].attr("text");
                        if (temp != celltext[this.idx].attr("text")) {
                            //if (tocompare == "") {
                            //    tocompare = "-";
                            //}
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
        }
    }
}





/* --------------------------------------------------------------------- */





function checkIfDataLoadedInR() {
    
    updatecounter += 1;
    
    if (updatecounter < 101) { // 10 seconds
        if (tempdatainfo.nrows > 0) {
            refresh_cols("import");
            updatecounter = 0; // don't erase!
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
            
            //updatecounter = 0; // don't erase!
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 1) {
            $("#result_main").append("<br><span style='color:red'>Warning: R still takes long to load the data...</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            //updatecounter = 0; // don't erase!
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 2) {
            $("#result_main").append("<br><span style='color:red'>Warning: is this such a big dataset...?</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            //updatecounter = 0; // don't erase!
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 3) {
            $("#result_main").append("<br><span style='color:red'>Warning: we're getting bored here...</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            //updatecounter = 0; // don't erase!
            rloadcycles += 1;
            setTimeout(checkIfDataLoadedInR, 50);
        }
        else if (rloadcycles == 4) {
            $("#result_main").append("<br><span style='color:red'>Error: OK I give up. It's just too long.</span><br>");
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
            
            //updatecounter = 0; // don't erase!
            rloadcycles = 0;
        }
        
        
        updatecounter = 0; // don't erase!
        
    }
}





/* --------------------------------------------------------------------- */





function consoleIfPathChanges() {
    
    // safety device
    updatecounter2 += 1;
    
    //console.log("consoleIfPathChanges");
    
    if (updatecounter2 < 21) { 
        if (dirfile.filepath[0][0] != pathcopy[0][0]) {
            
            console_command(current_command);
            updatecounter2 = 0; // don't erase!
        }
        else {
            setTimeout(consoleIfPathChanges, 50);
        }
    }
    else {
        updatecounter2 = 0; // don't erase!
    }
}





/* --------------------------------------------------------------------- */





function doWhenDataPointsAreReturned() {
    
    // safety device
    updatecounter += 1;
    
    if (updatecounter < 21) {
        if (lastvals.toString() != thsetter_vals.toString()) {
            drawPointsAndThresholds();
        }
        else {
            setTimeout(doWhenDataPointsAreReturned, 50);
        }
    }
    else {
        updatecounter = 0; // don't erase!
    }
}





/* --------------------------------------------------------------------- */





function doWhenXYplotPointsAreReturned() {
    
    // safety device
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
        
        updatecounter = 0; // don't erase!
    }
}





/* --------------------------------------------------------------------- */





function drawPointsAndThresholds() {
    calibrate.thsettervar = getTrueKeys(colclicks.calibrate.x);
    
    thsetter_content.remove();
    thsetter_content = papers["calibrate_main"].set().attr({stroke: "#a0a0a0"});
    
    var min = thsetter_vals[0][0];
    var max = thsetter_vals[thsetter_vals.length - 1][0];
    
    var lm = 160;
    var rm = $("#calibrate").width() - 27; //463;
    
    var thy = 234;
    
    if (thsetter_jitter.length != thsetter_vals.length) {
        thsetter_jitter = new Array(thsetter_vals);
        for (var i = 0; i < thsetter_vals.length; i++) {
            thsetter_jitter[i] = randomBetween(185, 215);
        }
    }
    
    for (var i = 0; i < thsetter_vals.length; i++) {
        var point = papers["calibrate_main"].circle(
            (rm - lm)*(thsetter_vals[i][0] - min)/(max - min) + lm,
            calibrate.jitter?thsetter_jitter[i]:200,
            4);
        point.attr({fill: "#ffffff", "fill-opacity": 0.0});
        point.txt = datainfo.rownames[i];
        point.hover(hoverIn, hoverOut, point, point);
        thsetter_content.push(point);
    }
    
    thsetter_content.push(sat(papers["calibrate_main"].text(lm - 3, thy + 15, min)));
    thsetter_content.push(sat(papers["calibrate_main"].text(rm + 3, thy + 15, max), {"anchor": "end"}));
    
    
    thsetter_content.push(papers["calibrate_main"].path([ // the horizontal axis
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
                if (calibrate.thresholds[i] < min) {
                    calibrate.thresholds[i] = min;
                    ths[i].attr({"text": min});
                }
                else if (calibrate.thresholds[i] > max) {
                    calibrate.thresholds[i] = max;
                    ths[i].attr({"text": max});
                }
                position = (rm - lm)*(calibrate.thresholds[i] - min)/(max - min) + lm;
                handles[i] = papers["calibrate_main"].path([
                    ["M", position, thy],
                    ["L", position - 5, thy + 7],
                    ["L", position + 5, thy + 7],
                    ["L", position, thy],
                    ["L", position, thy - 66]
                ]).attr({"stroke-width": 1.5, fill: "#cb2626", stroke: "#cb2626"});
                handles[i].min = min;
                handles[i].max = max;
                handles[i].name = i;
                handles[i].left = lm;
                handles[i].right = rm;
                handles[i].id = "thsetter";
                handles[i].drag(dragMove(handles[i]), dragStart, dragStop(handles[i]));
                thsetter_content.push(handles[i]);
            }
        }
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
    };
    
    
    function hoverOut() {
        txt.remove();
        txtfundal.remove();
    }
}





/* --------------------------------------------------------------------- */





function updateWhenThsChanged() {
    
    // safety device to break this loop
    // if neither visible data nor data coordinates change
    updatecounter += 1;
    
    if (updatecounter < 101) { // 100*50 = 5000 ms = 5 seconds
        
        if (thvalsfromR[0] == "noresponse") {
            // loop again, maybe R has responded
            setTimeout(updateWhenThsChanged, 50);
        }
        else {
            
            if (thvalsfromR[0] == "notnumeric") {
                
                var clthlen = calibrate.thresholds.length;
                calibrate.thresholds = new Array(clthlen);
                
                for (var i = 0; i < clthlen; i++) {
                    ths[i].attr({"text": ""});
                    calibrate.thresholds[i] = ""; // ?? necessary ??
                }
            }
            else {
                
                calibrate.thresholds = new Array(thvalsfromR.length);
                calibrate.thscopycrp = new Array(thvalsfromR.length);
                calibrate.thnames = new Array(thvalsfromR.length);
                for (var i = 0; i < thvalsfromR.length; i++) {
                    ths[i].attr({"text": thvalsfromR[i]});
                    calibrate.thresholds[i] = thvalsfromR[i];
                    calibrate.thscopycrp[i] = thvalsfromR[i];
                }
                
            }
            
            console_command("calibrate");
            
            
            if (calibrate.type == "crisp") {
                updatecounter = 0;
                thsetter2R.counter += 1;
                thsetter2R.cond = calibrate.x[0];
                
                drawPointsAndThresholds();
            }
        }
    }
    else {
        updatecounter = 0; // don't erase!
    }
}





/* --------------------------------------------------------------------- */





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
            var header = strwrap(string_command, 74, "+ ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            
            $("#result_main").append("<span style='color:blue'>" + header + "</span><br>");
            
            if (objname != "") {
                $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
                $("#result_main").append("<span style='color:blue'>" + objname + "</span><br>");
            }
            
            $("#result_main").append(toprint.split(" ").join("&nbsp;") + "<br>");
            
            $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
            
            
            $("#result_main").animate({
                scrollTop: $("#result_main")[0].scrollHeight
            }, 1000);
        }
        else {
            setTimeout(printWhenOutputChanges, 50);
        }
        
    }
    else {
        
        $("#result_main").append("<br><br><span style='color:red'>Error in printWhenOutputChanges:<br>R takes too long to respond.</span><br>");
        $("#result_main").animate({
            scrollTop: $("#result_main")[0].scrollHeight
        }, 1000);
        
        updatecounter = 0;
    }
}





/* --------------------------------------------------------------------- */





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
            var header = strwrap(string_command, 74, "+ ").replace(/£|§|∞|≠/g, function(x) {return cr[x]});
            
            $("#result_main").append("<span style='color:blue'>" + header + "</span><br><br>");
            
            if (toprint != "") {
                $("#result_main").append(toprint.split(" ").join("&nbsp;") + "<br>");
            }
            
            $("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
            
            
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





/* --------------------------------------------------------------------- */





function print_dirs() {
    if ($("#import").length && current_command == "import") {
        
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
            
            var rw = 400; // import.inside.importdirs.width
            papers["importdirs"].clear();
            
            var i, aaa, bbb, ccc, toprint, printplus;
            var row = 10;
            var fill_opacity = 0.3;
            var rects_back = papers["importdirs"].set();
            var texts = papers["importdirs"].set();
            var rects = papers["importdirs"].set();
            var pluses = papers["importdirs"].set();
            var x = 30; // pixels from the right where to print the text
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
    
    
    
    // now only directories for the export dialog
    if ($("#export").length && current_command == "export") {
        
        papers["expath"].goToDir = function(dir) {
            dirfile_chosen[0] = "dir";
            dirfile_chosen[1] = dir;
            pathcopy = dirfile.filepath;
            Shiny.onInputChange("dirfile_chosen", dirfile_chosen);
            printDirsWhenPathChanges();
        }
        
        setPath(papers["expath"], dirfile.wd);
        
        var rw = 400; // export.inside.exportdirs.width
        papers["exportdirs"].clear();
        
        var i, aaa, bbb, ccc, extoprint, printplus;
        var row = 10;
        var fill_opacity = 0.3;
        var exrects_back = papers["exportdirs"].set();
        var extexts = papers["exportdirs"].set();
        var exrects = papers["exportdirs"].set();
        var expluses = papers["exportdirs"].set();
        var x = 30; // pixels from the right where to print the text
        var dirs_length = 1*((dirfile.dirs === null)?0:dirfile.dirs.length);
        var files_length = 1*((dirfile.files === null)?0:dirfile.files.length);
        var exclicked = -1;
        
        papers["export_main"].ovr.hideIt();
        if (dirfile.files != void 0) {
            if (dirfile.files.indexOf(exportobj.filename) >= 0) {
                papers["export_main"].ovr.showIt();
            }
        }
        
        console_command("export");
        
    
        for (i = 0; i < (1 + dirs_length + files_length); i++) {
            
            printplus = false;
            
            bbb = papers["exportdirs"].rect(0, row - 10, rw, 20);
            bbb.id = i;
            exrects_back.push(bbb);
            
            if (i == 0) {
                extoprint = "..";
                expluses.push(papers["exportdirs"].text(0, 0, ""));
            }
            else {
                if (i < (dirs_length + 1)) {
                    printplus = true;
                    extoprint = dirfile.dirs[i - 1];
                }
                else {
                    extoprint = dirfile.files[i - dirs_length - 1];
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
                    
                    if (this.id < (dirs_length + 1)) {
                        expluses[this.id].attr({fill: "#ffffff"});
                    }
                    
                    if (this.id > dirs_length) { // it's a file
                        papers["export_main"].newname.attr({"text": this.txt});
                        exportobj.filename = this.txt;
                        papers["export_main"].ovr.showIt();
                    }
                    
                })
                .dblclick(function() {
                    
                    dirfile_chosen[0] = (this.id < (dirs_length + 1))?"dir":"file";
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
}





/* --------------------------------------------------------------------- */





function updateWhenDataChanged() {
    
    // safety device to break this loop
    // if neither visible data nor data coordinates change
    updatecounter += 1;
    
    if (updatecounter < 21) { // 20*50 = 1000 ms = 1 second
        if (theData.toString() != visibledata | dataCoords != coordscopy) {
            update_data();
            updatecounter = 0; // don't erase!
        }
        else {
            // loop again, maybe R has responded
            setTimeout(updateWhenDataChanged, 50);
        }
    }
    else {
        updatecounter = 0; // don't erase!
    }
}





/* --------------------------------------------------------------------- */





function printIfDirsFilesChange() {
    
    var test = "";
    
    if (dirfile.dirs != null) {
        for (var i = 0; i < dirfile.dirs.length; i++) {
            test += dirfile.dirs[i];
        }
    }
    
    if (dirfile.files != null) {
        for (var i = 0; i < dirfile.files.length; i++) {
            test += dirfile.files[i];
        }
    }
    
    
    
    if (test != dirsfilescopy) {
        print_dirs();
    }
    else {
        setTimeout(printDirsWhenPathChanges, 50);
    }
}





/* --------------------------------------------------------------------- */





function printDirsWhenPathChanges() {
    
    if (dirfile.filepath != pathcopy) {
        print_dirs();
    }
    else {
        setTimeout(printDirsWhenPathChanges, 50);
    }
}






/* --------------------------------------------------------------------- */






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






/* --------------------------------------------------------------------- */






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
        
        // determine position
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
        
        
        
        // handle the decreasing checkboxes
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






/* --------------------------------------------------------------------- */






function makePapers(obj) {
    papers[obj.name + "_main"] = Raphael(obj.name + "_main", obj.width, obj.height);
    
    if (obj.inside != undefined) {
        var keys = getKeys(obj.inside);
        for (var i = 0; i < keys.length; i++) {
            papers[keys[i]] = Raphael(keys[i], obj.inside[keys[i]].width, obj.inside[keys[i]].height);
        }
    }
}






/* --------------------------------------------------------------------- */






$("#menu_import").click(function() {
    
    var settings = {
        name:       "import",
        title:      "Import from text file",
        position:   {my: "left top", at: "left+5px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      680,
        height:     433,
        inside: {
            // import directories path
            impath:     {border: true, left: 270, top:  62, width: 400, height:  40},
            importcols: {border: true, left:  14, top: 260, width: 235, height: 120},
            importdirs: {border: true, left: 264, top:  80, width: 400, height: 300}
        }
    };
    
    // check if the dialog was already created
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





/* --------------------------------------------------------------------- */





$("#menu_export").click(function() {
    var settings = {
        name:       "export",
        title:      "Export to text file",
        position:   {my: "left top", at: "left+5px top+33px", of: window, collision: "flip"},
        resizable:  false,
        width:      655,
        height:     375,
        inside: {
            // export directories path
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





/* --------------------------------------------------------------------- */





$("#menu_edit").click(function() {
    
    var vscrollbar = datainfo.nrows > visiblerows;
    var hscrollbar = datainfo.ncols > visiblecols;
    var settings = {
        name:       "data_editor",
        title:      "Data editor",
        position:   {my: "left top", at: "left+" + testX + "px top+" + testY + "px", of: window, collision: "flip"},
        resizable:  true,
        width:      200, // arbitrary value, see below
        height:     150, // arbitrary value, see below
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
        update_data(); // apparently this is sometimes necessary
    }
    else {
        
        createDialog(settings);
        makePapers(settings);
        
                                           // +1 because they are zero-based
                                           // and +1 for the rownames column
        $("#data_editor").width((visiblecols + 1 + 1)*70 + 1*(vscrollbar?scrollbarsWH:0));
                                            // +1 because they are zero-based
                                            // and +2 for the header and the colnames
        $("#data_editor").height((visiblerows + 1 + 2)*20 + 1*(hscrollbar?scrollbarsWH:0));
        
        
        $("#data_editor").draggable({
            drag: function(ev, ui) {
                testX = ui.position.left;
                testY = ui.position.top;
            }
        });
        
        print_data(); // this also established the new width and height of the entire dialog
        
        // redimension the "_main" component of the dialog
        $("#data_editor_main").width($("#data_editor").width());
        $("#data_editor_main").height($("#data_editor").height() - 20);
        
        
        $("#data_editor").resizable({
            start: function(event, ui) {
                //scrollTop = $("#data_body").scrollTop();
                //$("#data_body").scrollTop(0);
            },
            resize: function(event, ui) {
                // 40px from 20 the header and 20 the colnames
                // 70px the rownames
                // 20px the height of a single row
                
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
                var scrollvh2 = scrollvh.slice(); // copy of scrollvh
                
                $("#data_editor").width( (visiblecols + 1)*70 + 1*(vscrollbar?scrollbarsWH:0));
                $("#data_editor").height((visiblerows + 2)*20 + 1*(hscrollbar?scrollbarsWH:0));
                $("#data_editor_main").width($("#data_editor").width());
                $("#data_editor_main").height($("#data_editor").height() - 20);
                
                $("#data_body").width($("#data_editor").width() - 70);
                $("#data_body").height($("#data_editor").height() - 40);
                
                
                $("#data_colnames").width(visiblecols*70);
                $("#data_rownames").height(visiblerows*20);
                
                
                //                                       -1 to make them zero-based
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
                var horizontal = $("#data_body").scrollLeft(); // always non-negative numbers
                
                var cellstoright = Math.round(horizontal/70);
                var cellsdown = Math.round(vertical/20);
                
                
                // scrollvh, visiblecols and visiblerows ARE zero-based
                // datainfo.ncols and nrows are NOT zero-based
                
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




/* --------------------------------------------------------------------- */




$("#menu_calibrate").click(function() {
    var settings = {
        name:      "calibrate",
        title:     "Calibrate",
        position:  {my: "left top", at: "left+80px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     490,
        height:    330,
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
            if (thsetter_vals.length > 0) {
                drawPointsAndThresholds();
            }
        }
    });
    
    
    
    $("#main_menu").smartmenus('menuHideAll');
    return false;
});




/* --------------------------------------------------------------------- */




$("#menu_recode").click(function() {
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




/* --------------------------------------------------------------------- */




$("#menu_tt").click(function() {
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




/* --------------------------------------------------------------------- */




$("#menu_eqmcc").click(function() {
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




/* --------------------------------------------------------------------- */




$("#menu_xyplot").click(function() {
    var settings = {
        name:      "xyplot",
        title:     "XY plot",
        position:  {my: "left top", at: "left+240px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     720,
        height:    567,
        inside: {
            xyplotcols1: {border: true, left: 13, top:   54, width: 140, height: 120},
            xyplotcols2: {border: true, left: 13, top:  210, width: 140, height: 120}
            //plot: {border: true, left: 160, top: 30: width}
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




/* --------------------------------------------------------------------- */




$("#menu_venn").click(function() {
    var settings = {
        name:      "venn",
        title:     "Venn diagram",
        position:  {my: "left top", at: "left+240px top+33px", of: window, collision: "flip"},
        resizable: true,
        width:     430, // asta este si minWidth pentru ca e resizable
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
            paper.scale = (Math.min($(paper.canvas).width() - 20, $(paper.canvas).height() - 70))/400;
            
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




/* --------------------------------------------------------------------- */




$("#menu_about").click(function() {
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
            "R package: QCAGUI, version 2.0-0",
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
            "The package QCAGUI is a fork of the former package QCA version 1.1-4,",
            "with many improvements and a reactive graphical user interface.",
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
/* --------------------------------------------------------------------- */




createDialog({
    name:      "command",
    title:     "Command constructor",
    position:  {my: "right top", at: "right-10px top+33px", of: window, collision: "fitflip"},
    resizable: true,
    width:     650, //?? nu are un Raphael la interior
    height:    commandHeight, //??? de verificat
    closable: false
    
});

createDialog({
    name:      "result",
    title:     "Output window",
    position:  {my: "left top", at: "left bottom+4px", of: "#command", collision: "fitflip"},
    resizable: true,
    width:     650, //?? nu are un Raphael la interior
    height:    resultHeight, //??? de verificat
    closable: false
});


$("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");
$("#result_main").append("<span style='color:blue'>library(QCA)</span><br>");
$("#result_main").append("<span style='color:red'>" + 
    "Loading required package: QCAGUI<br><br>" +
    "To cite this package in publications, please use:<br><br>" + 
    "  Dusa, Adrian (2007). User manual for the QCA(GUI) package in R.<br>".split(" ").join("&nbsp;") + 
    "  Journal of Business Research 60(5), 576-586.<br><br>".split(" ").join("&nbsp;"))
$("#result_main").append("<span style='color:#932192'>" + "> " + "</span>");



/* --------------------------------------------------------------------- */




function showDialogToFront(settings) {
    //$("#" + settings.name).show();
    $("#" + settings.name).fadeIn();
    
    $("#" + settings.name).css("z-index", "9000");
    
    // register vertical scroll for all subdivs
    var scrollTop = {};
    var scrollLeft = {};
    
    scrollTop[settings.name + "_main"] = $("#" + settings.name + "_main").scrollTop();
    scrollLeft[settings.name + "_main"] = $("#" + settings.name + "_main").scrollLeft();
        
    if (settings.inside !== undefined) {
        var keys = getKeys(settings.inside);
        // "keys" is going to be defined below
        for (var i = 0; i < keys.length; i++) {
            scrollTop[keys[i]] = $("#" + keys[i]).scrollTop();
            scrollLeft[keys[i]] = $("#" + keys[i]).scrollLeft();
        }
    }
    
    // simulate toFront()
    $("#" + settings.name).appendTo(document.body);
    
    // necessary to distinguish between import and export lists of files and directories
    current_command = settings.name;
    if (settings.name != "command" && settings.name != "result") {
        console_command(current_command);
    }
    
    $("#" + settings.name + "_main").scrollTop(scrollTop[settings.name + "_main"]);
    $("#" + settings.name + "_main").scrollLeft(scrollLeft[settings.name + "_main"]);
    
    // redo vertical scroll to their location
    if (settings.inside !== undefined) {
        for (var i = 0; i < keys.length; i++) {
            $("#" + keys[i]).scrollTop(scrollTop[keys[i]]);
            $("#" + keys[i]).scrollLeft(scrollLeft[keys[i]]);
        }
    }
}




/* --------------------------------------------------------------------- */




function createDialog(settings) {
    
    var dialog = document.createElement("div");
    dialog.id = settings.name;
    document.body.appendChild(dialog);
    
    // necessary to distinguish between import and export lists of files and directories
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
        if (settings.name != "command" && settings.name != "result") {
            $("#" + settings.name).hide("fade", { percent: 0 }, 500);
        }
        /*
        if (settings.closable !== undefined) {
            if (!settings.closable) {
                $("#" + settings.name).show();
            }
        }
        */
    });
    
    $("#" + settings.name + "_img").mouseup(function(event) {
        if (clickfired) {
            if (settings.name != "command" && settings.name != "result") {
                $("#" + settings.name).hide("fade", { percent: 0 }, 500);
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
            // simulate toFront()
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
    // the whole "s"hapes for 2, 3, 4 and 5 sets variations
    "s1": [
        "M 200,100.6 C 145.1,100.6 100.5,145.1 100.5,200.1 100.5,255 145.1,299.5 200,299.5 254.9,299.5 299.5,255 299.5,200.1 299.5,145.1 254.9,100.6 200,100.6 z"
    ],
    "s2": [
        "M 150,100.6 C 95.1,100.6 50.5,145.1 50.5,200.1 50.5,255 95.1,299.5 150,299.5 204.9,299.5 249.5,255 249.5,200.1 249.5,145.1 204.9,100.6 150,100.6 z",
        "M 250,100.6 C 195.1,100.6 150.5,145.1 150.5,200.1 150.5,255 195.1,299.5 250,299.5 304.9,299.5 349.5,255 349.5,200.1 349.5,145.1 304.9,100.6 250,100.6 z"
    ],
    "s3": [
        "M 66.15,141.5 C 52.15,141.5 40.45,146 32.75,155.6 7.95,186.2 32.55,256.7 87.65,313.2 142.8,369.6 207.5,390.5 232.3,359.9 257.1,329.3 232.5,258.8 177.4,202.4 139.5,163.6 97.05,141.6 66.15,141.5 z",
        "M 199.5,42.26 C 162.9,42.35 132.1,99.6 129.5,174.8 126.8,253.6 156.2,322.3 195.2,328.2 234.1,334.1 267.8,275 270.5,196.1 273.2,117.3 243.9,48.57 204.9,42.67 203.1,42.39 201.3,42.26 199.5,42.26 z",
        "M 333.9,141.5 C 303,141.6 260.6,163.6 222.7,202.4 167.6,258.8 143,329.3 167.8,359.9 192.5,390.5 257.3,369.6 312.4,313.2 367.5,256.7 392.1,186.2 367.3,155.6 359.5,146 347.9,141.5 333.9,141.5 z"
    ],
    "s4": [
        "M 56.73,145.2 C 38.93,145.2 24.83,151.4 17.13,164.2 -3.372,198.2 29.23,266.6 90.03,316.8 150.8,367 216.8,380.1 237.3,346 257.9,312 225.3,243.6 164.5,193.4 126.5,162 86.43,145.1 56.73,145.2 z",
        "M 139.5,68.8 C 130.6,68.75 122.5,71.25 115.7,76.58 84.76,100.9 93.06,175.1 134.4,242.4 175.6,309.6 234.2,344.4 265.1,320.1 296.1,295.7 287.7,221.5 246.5,154.2 214.2,101.7 171.5,68.99 139.5,68.8 z",
        "M 260.6,68.75 C 269.5,68.75 277.6,71.25 284.4,76.55 315.3,100.9 307,175.1 265.7,242.4 224.5,309.6 165.9,344.4 135,320.1 104,295.7 112.4,221.5 153.6,154.2 185.9,101.7 228.6,68.95 260.6,68.75 z",
        "M 202.4,365 C 184.6,365 170.5,358.8 162.8,346 142.3,311.9 174.9,243.5 235.7,193.3 296.4,143.1 362.4,130 382.9,164.1 403.5,198.1 370.9,266.5 310.1,316.7 272.1,348.2 232.1,365.1 202.4,365 z"
    ],
    "s5": [
        "M 107.9,100.1 C 65.96,100.5 34.06,114 26.16,138.5 13.36,177.6 66.76,230 145.3,255.5 223.8,281.1 297.8,270 310.5,230.9 323.2,191.7 269.9,139.3 191.4,113.8 161.9,104.3 133.1,99.85 107.9,100.1 z",
        "M 212.6,25.53 C 171.5,25.53 138.1,92.46 138.1,175 138.1,257.6 171.5,324.5 212.6,324.5 253.8,324.5 287.2,257.6 287.2,175 287.2,92.46 253.8,25.53 212.6,25.53 z",
        "M 295.8,129.6 C 270.6,129.3 241.8,133.8 212.4,143.4 133.8,168.9 80.45,221.3 93.25,260.4 105.9,299.6 179.9,310.6 258.4,285.1 337,259.5 390.4,207.2 377.6,168 369.7,143.5 337.8,130 295.8,129.6 z",
        "M 143.4,119.2 C 133.5,119.2 124.6,121.6 117.4,126.9 84.1,151.1 96.4,224.9 145,291.7 193.5,358.5 259.9,393.1 293.2,368.9 326.5,344.7 314.1,270.9 265.6,204.1 227.6,151.9 178.8,119.4 143.4,119.2 z",
        "M 225.6,101.1 C 190.2,101.3 141.4,133.8 103.5,186 54.86,252.8 42.56,326.6 75.86,350.8 109.2,375 175.5,340.4 224,273.6 272.6,206.8 285,133 251.7,108.8 244.4,103.5 235.5,101 225.6,101.1 z"
    ],
    // pre-register the result of the "c"ustom intersections
    // output by raphael.boolean.js
    // the order is exactly of the rows in the truth table
    "c1": [
        "M0,0C0,0,400,0,400,0C400,0,400,400,400,400C400,400,0,400,0,400C0,400,0,0,0,0M200,100.6C145.1,100.6,100.5,145.1,100.5,200.1C100.5,255,145.1,299.5,200,299.5C254.9,299.5,299.5,255,299.5,200.1C299.5,145.1,254.9,100.6,200,100.6C200,100.6,200,100.6,200,100.6",
        "M200,100.6C145.1,100.6,100.5,145.1,100.5,200.1C100.5,255,145.1,299.5,200,299.5C254.9,299.5,299.5,255,299.5,200.1C299.5,145.1,254.9,100.6,200,100.6C200,100.6,200,100.6,200,100.6"
    ],
    "c2": [
        "M0,0C0,0,400,0,400,0C400,0,400,400,400,400C400,400,0,400,0,400C0,400,0,0,0,0M150,100.6C95.1,100.6,50.5,145.1,50.5,200.1C50.5,255,95.1,299.5,150,299.5C168.225,299.5,185.314,294.596,200,286.015C214.686,294.596,231.775,299.5,250,299.5C304.9,299.5,349.5,255,349.5,200.1C349.5,145.1,304.9,100.6,250,100.6C250,100.6,250,100.6,250,100.6C231.775,100.6,214.686,105.504,200,114.089C185.314,105.504,168.225,100.6,150,100.6C150,100.6,150,100.6,150,100.6",
        "M200,286.015C229.596,268.809,249.5,236.775,249.5,200.1C249.5,163.358,229.596,131.302,200,114.089C214.686,105.504,231.775,100.6,250,100.6C250,100.6,250,100.6,250,100.6C304.9,100.6,349.5,145.1,349.5,200.1C349.5,255,304.9,299.5,250,299.5C231.775,299.5,214.686,294.596,200,286.015",
        "M150,100.6C95.1,100.6,50.5,145.1,50.5,200.1C50.5,255,95.1,299.5,150,299.5C168.225,299.5,185.314,294.596,200,286.015C170.404,268.809,150.5,236.775,150.5,200.1C150.5,163.358,170.404,131.302,200,114.089C185.314,105.504,168.225,100.6,150,100.6C150,100.6,150,100.6,150,100.6",
        "M200,286.015C229.596,268.809,249.5,236.775,249.5,200.1C249.5,163.358,229.596,131.302,200,114.089C170.404,131.302,150.5,163.358,150.5,200.1C150.5,236.775,170.404,268.809,200,286.015"
    ],
    "c3": [
        "M0,0C0,0,400,0,400,0C400,0,400,400,400,400C400,400,0,400,0,400C0,400,0,0,0,0M66.15,141.5C52.15,141.5,40.45,146,32.75,155.6C7.95,186.2,32.55,256.7,87.65,313.2C125.969,352.388,168.899,374.437,199.847,373.973C199.907,373.974,199.967,373.975,200.027,373.975C200.086,373.976,200.145,373.977,200.207,373.973C231.148,374.437,274.116,352.388,312.4,313.2C367.5,256.7,392.1,186.2,367.3,155.6C359.5,146,347.9,141.5,333.9,141.5C333.9,141.5,333.9,141.5,333.9,141.5C315.493,141.56,293.006,149.39,269.819,163.922C264.854,99.381,238.471,47.749,204.9,42.67C203.1,42.39,201.3,42.26,199.5,42.26C199.5,42.26,199.5,42.26,199.5,42.26C164.705,42.346,135.151,94.094,130.107,163.827C106.961,149.355,84.515,141.559,66.15,141.5C66.15,141.5,66.15,141.5,66.15,141.5",
        "M199.847,373.973C199.906,373.972,199.966,373.971,200.027,373.975C199.967,373.975,199.907,373.974,199.847,373.973M200.027,373.975C200.087,373.974,200.147,373.973,200.207,373.973C200.145,373.977,200.086,373.976,200.027,373.975M200.207,373.973C213.644,373.701,224.798,369.157,232.3,359.9C242.56,347.241,244.365,327.752,239.028,305.247C256.703,281.73,268.919,242.311,270.5,196.1C270.876,185.13,270.632,174.355,269.819,163.922C293.006,149.39,315.493,141.56,333.9,141.5C333.9,141.5,333.9,141.5,333.9,141.5C347.9,141.5,359.5,146,367.3,155.6C392.1,186.2,367.5,256.7,312.4,313.2C274.116,352.388,231.148,374.437,200.207,373.973",
        "M200.054,228.537C193.236,219.628,185.661,210.856,177.4,202.4C162.026,186.661,145.903,173.686,130.107,163.827C135.151,94.094,164.705,42.346,199.5,42.26C199.5,42.26,199.5,42.26,199.5,42.26C201.3,42.26,203.1,42.39,204.9,42.67C238.471,47.749,264.854,99.381,269.819,163.922C254.083,173.771,238.024,186.712,222.7,202.4C214.44,210.855,206.865,219.627,200.054,228.537",
        "M239.028,305.247C233.444,281.529,219.928,254.462,200.054,228.537C206.865,219.627,214.44,210.855,222.7,202.4C238.024,186.712,254.083,173.771,269.819,163.922C270.632,174.355,270.876,185.13,270.5,196.1C268.919,242.311,256.703,281.73,239.028,305.247",
        "M66.15,141.5C52.15,141.5,40.45,146,32.75,155.6C7.95,186.2,32.55,256.7,87.65,313.2C125.969,352.388,168.899,374.437,199.847,373.973C186.414,373.701,175.272,369.157,167.8,359.9C157.446,347.125,155.703,327.396,161.218,304.631C140.572,276.926,127.671,228.18,129.5,174.8C129.628,171.092,129.825,167.428,130.107,163.827C106.961,149.355,84.515,141.559,66.15,141.5C66.15,141.5,66.15,141.5,66.15,141.5",
        "M199.847,373.973C199.906,373.972,199.966,373.971,200.027,373.975C200.087,373.974,200.147,373.973,200.207,373.973C213.644,373.701,224.798,369.157,232.3,359.9C242.56,347.241,244.365,327.752,239.028,305.247C226.541,321.931,211.317,330.644,195.2,328.2C182.619,326.297,171.037,317.858,161.218,304.631C155.703,327.396,157.446,347.125,167.8,359.9C175.272,369.157,186.414,373.701,199.847,373.973",
        "M200.054,228.537C193.236,219.628,185.661,210.856,177.4,202.4C162.026,186.661,145.903,173.686,130.107,163.827C129.825,167.428,129.628,171.092,129.5,174.8C127.671,228.18,140.572,276.926,161.218,304.631C166.888,281.064,180.35,254.238,200.054,228.537",
        "M239.028,305.247C233.444,281.529,219.928,254.462,200.054,228.537C180.35,254.238,166.888,281.064,161.218,304.631C171.037,317.858,182.619,326.297,195.2,328.2C211.317,330.644,226.541,321.931,239.028,305.247"
    ],
    "c4": [
        "M0,0C0,0,400,0,400,0C400,0,400,400,400,400C400,400,0,400,0,400C0,400,0,0,0,0M56.73,145.2C38.93,145.2,24.83,151.4,17.13,164.2C-3.372,198.2,29.23,266.6,90.03,316.8C129.1,349.075,170.333,366.014,200.232,364.914C200.926,364.989,201.66,365,202.4,365C202.4,365,202.4,365,202.4,365C232.1,365.1,272.1,348.2,310.1,316.7C370.9,266.5,403.5,198.1,382.9,164.1C369.734,142.199,337.798,139.768,300.547,154.149C306.691,119.316,301.663,90.154,284.4,76.55C277.6,71.25,269.5,68.75,260.6,68.75C260.6,68.75,260.6,68.75,260.6,68.75C242.555,68.863,221.106,79.327,200.04,97.862C178.98,79.349,157.54,68.907,139.5,68.8C139.5,68.8,139.5,68.8,139.5,68.8C130.6,68.75,122.5,71.25,115.7,76.58C98.405,90.174,93.371,119.353,99.537,154.212C84.017,148.221,69.426,145.157,56.73,145.2C56.73,145.2,56.73,145.2,56.73,145.2",
        "M200.232,364.914C216.858,364.334,229.98,358.176,237.3,346C240.509,340.703,242.427,334.572,243.121,327.79C251.351,327.551,258.801,325.054,265.1,320.1C285.617,303.951,288.876,265.987,276.777,222.642C288.772,199.202,296.784,175.597,300.547,154.149C337.798,139.768,369.734,142.199,382.9,164.1C403.5,198.1,370.9,266.5,310.1,316.7C272.1,348.2,232.1,365.1,202.4,365C202.4,365,202.4,365,202.4,365C201.66,365,200.926,364.989,200.232,364.914",
        "M258.693,176.192C255.023,168.829,250.953,161.474,246.5,154.2C232.409,131.297,216.339,112.16,200.04,97.862C221.106,79.327,242.555,68.863,260.6,68.75C260.6,68.75,260.6,68.75,260.6,68.75C269.5,68.75,277.6,71.25,284.4,76.55C301.663,90.154,306.691,119.316,300.547,154.149C287.081,159.333,272.916,166.727,258.693,176.192",
        "M276.777,222.642C272.583,207.58,266.53,191.866,258.693,176.192C272.916,166.727,287.081,159.333,300.547,154.149C296.784,175.597,288.772,199.202,276.777,222.642",
        "M141.394,176.229C127.168,166.768,113.003,159.389,99.537,154.212C93.371,119.353,98.405,90.174,115.7,76.58C122.5,71.25,130.6,68.75,139.5,68.8C139.5,68.8,139.5,68.8,139.5,68.8C157.54,68.907,178.98,79.349,200.04,97.862C183.748,112.167,167.685,131.306,153.6,154.2C149.14,161.486,145.064,168.853,141.394,176.229",
        "M243.121,327.79C244.507,314.885,241.535,299.664,234.846,283.504C245.693,271.776,256.163,257.956,265.7,242.4C269.712,235.862,273.413,229.259,276.777,222.642C288.876,265.987,285.617,303.951,265.1,320.1C258.801,325.054,251.351,327.551,243.121,327.79",
        "M200.056,228.379C189.733,216.215,177.79,204.373,164.5,193.4C156.848,187.077,149.112,181.342,141.394,176.229C145.064,168.853,149.14,161.486,153.6,154.2C167.685,131.306,183.748,112.167,200.04,97.862C216.339,112.16,232.409,131.297,246.5,154.2C250.953,161.474,255.023,168.829,258.693,176.192C251.012,181.289,243.314,187.003,235.7,193.3C222.374,204.303,210.403,216.179,200.056,228.379",
        "M234.846,283.504C227.482,265.65,215.591,246.653,200.056,228.379C210.403,216.179,222.374,204.303,235.7,193.3C243.314,187.003,251.012,181.289,258.693,176.192C266.53,191.866,272.583,207.58,276.777,222.642C273.413,229.259,269.712,235.862,265.7,242.4C256.163,257.956,245.693,271.776,234.846,283.504",
        "M56.73,145.2C38.93,145.2,24.83,151.4,17.13,164.2C-3.372,198.2,29.23,266.6,90.03,316.8C129.1,349.075,170.333,366.014,200.232,364.914C183.438,364.473,170.18,358.268,162.8,346C159.615,340.702,157.712,334.576,157.024,327.805C148.78,327.562,141.312,325.064,135,320.1C114.487,303.954,111.226,266.003,123.315,222.67C111.312,199.242,103.301,175.65,99.537,154.212C84.017,148.221,69.426,145.157,56.73,145.2C56.73,145.2,56.73,145.2,56.73,145.2",
        "M200.232,364.914C216.858,364.334,229.98,358.176,237.3,346C240.509,340.703,242.427,334.572,243.121,327.79C230.177,328.224,215.323,323.119,200.05,313.339C184.796,323.105,169.957,328.224,157.024,327.805C157.712,334.576,159.615,340.702,162.8,346C170.18,358.268,183.438,364.473,200.232,364.914",
        "M165.283,283.544C154.427,271.802,143.946,257.971,134.4,242.4C130.39,235.871,126.69,229.277,123.315,222.67C111.226,266.003,114.487,303.954,135,320.1C141.312,325.064,148.78,327.562,157.024,327.805C155.633,314.908,158.61,299.693,165.283,283.544",
        "M200.05,313.339C188.483,305.959,176.676,295.903,165.283,283.544C158.61,299.693,155.633,314.908,157.024,327.805C169.957,328.224,184.796,323.105,200.05,313.339",
        "M141.394,176.229C127.168,166.768,113.003,159.389,99.537,154.212C103.301,175.65,111.312,199.242,123.315,222.67C127.51,207.612,133.565,191.901,141.394,176.229",
        "M243.121,327.79C244.507,314.885,241.535,299.664,234.846,283.504C223.442,295.873,211.625,305.953,200.05,313.339C215.323,323.119,230.177,328.224,243.121,327.79",
        "M200.056,228.379C189.733,216.215,177.79,204.373,164.5,193.4C156.848,187.077,149.112,181.342,141.394,176.229C133.565,191.901,127.51,207.612,123.315,222.67C126.69,229.277,130.39,235.871,134.4,242.4C143.946,257.971,154.427,271.802,165.283,283.544C172.638,265.678,184.529,246.667,200.056,228.379",
        "M234.846,283.504C227.482,265.65,215.591,246.653,200.056,228.379C184.529,246.667,172.638,265.678,165.283,283.544C176.676,295.903,188.483,305.959,200.05,313.339C211.625,305.953,223.442,295.873,234.846,283.504"
    ],
    "c5": [
        "M0,0C0,0,400,0,400,0C400,0,400,400,400,400C400,400,0,400,0,400C0,400,0,0,0,0M107.9,100.1C65.96,100.5,34.06,114,26.16,138.5C17.403,165.25,39.631,198.225,79.739,224.535C51.829,279.111,48.902,331.209,75.86,350.8C98.696,367.376,136.996,356.365,174.446,326.295C217.692,369.586,266.27,388.471,293.2,368.9C315.974,352.35,317.373,312.601,300.447,267.753C355.007,239.971,387.952,199.702,377.6,168C369.7,143.5,337.8,130,295.8,129.6C295.8,129.6,295.8,129.6,295.8,129.6C291.862,129.553,287.837,129.623,283.725,129.826C274.173,69.36,245.94,25.53,212.6,25.53C212.6,25.53,212.6,25.53,212.6,25.53C184.465,25.53,159.937,56.895,147.277,103.178C133.51,100.987,120.271,99.977,107.9,100.1C107.9,100.1,107.9,100.1,107.9,100.1",
        "M79.739,224.535C84.236,227.518,88.989,230.405,93.951,233.189C90.817,242.617,90.444,251.828,93.25,260.4C99.394,279.44,120.012,291.827,148.624,296.576C156.847,307.44,165.532,317.392,174.446,326.295C136.996,356.365,98.696,367.376,75.86,350.8C48.902,331.209,51.829,279.111,79.739,224.535",
        "M187.056,315.417C195.017,321.31,203.625,324.5,212.6,324.5C232.555,324.5,250.68,308.806,264.044,283.192C276.974,278.703,289.173,273.495,300.447,267.753C317.373,312.601,315.974,352.35,293.2,368.9C266.27,388.471,217.692,369.586,174.446,326.295C178.667,322.911,182.878,319.279,187.056,315.417",
        "M148.624,296.576C155.563,297.767,163.003,298.479,170.822,298.724C175.826,305.568,181.269,311.211,187.056,315.417C182.878,319.279,178.667,322.911,174.446,326.295C165.532,317.392,156.847,307.44,148.624,296.576",
        "M294.009,252.36C302.052,246.613,307.732,239.422,310.5,230.9C316.649,211.92,307.326,189.846,287.135,169.233C286.878,155.546,285.701,142.33,283.725,129.826C287.837,129.623,291.862,129.553,295.8,129.6C295.8,129.6,295.8,129.6,295.8,129.6C337.8,130,369.7,143.5,377.6,168C387.952,199.702,355.007,239.971,300.447,267.753C298.538,262.681,296.389,257.54,294.009,252.36",
        "M93.951,233.189C101.25,237.297,109.006,241.178,117.164,244.769C124.396,260.315,133.72,276.196,145,291.7C146.196,293.347,147.403,294.975,148.624,296.576C120.012,291.827,99.394,279.44,93.25,260.4C90.444,251.828,90.817,242.617,93.951,233.189",
        "M264.044,283.192C267.343,276.952,270.341,270.082,273.009,262.703C281.111,260.045,288.198,256.593,294.009,252.36C296.389,257.54,298.538,262.681,300.447,267.753C289.173,273.495,276.974,278.703,264.044,283.192",
        "M117.164,244.769C126.091,248.717,135.5,252.318,145.3,255.5C146.984,256.049,148.667,256.582,150.344,257.082C155.736,273.527,162.702,287.706,170.822,298.724C163.003,298.479,155.563,297.767,148.624,296.576C147.403,294.975,146.196,293.347,145,291.7C133.72,276.196,124.396,260.315,117.164,244.769",
        "M185.756,112.046C172.667,108.098,159.755,105.153,147.277,103.178C159.937,56.895,184.465,25.53,212.6,25.53C212.6,25.53,212.6,25.53,212.6,25.53C245.94,25.53,274.173,69.36,283.725,129.826C278.303,130.07,272.746,130.524,267.075,131.201C264.075,121.751,258.98,114.09,251.7,108.8C244.4,103.5,235.5,101,225.6,101.1C225.6,101.1,225.6,101.1,225.6,101.1C213.552,101.168,199.953,104.977,185.756,112.046",
        "M241.602,135.477C226.581,127.129,209.673,119.736,191.4,113.8C189.515,113.193,187.633,112.607,185.756,112.046C199.953,104.977,213.552,101.168,225.6,101.1C225.6,101.1,225.6,101.1,225.6,101.1C235.5,101,244.4,103.5,251.7,108.8C258.98,114.09,264.075,121.751,267.075,131.201C258.792,132.163,250.271,133.59,241.602,135.477",
        "M264.044,283.192C250.68,308.806,232.555,324.5,212.6,324.5C203.625,324.5,195.017,321.31,187.056,315.417C193.16,309.789,199.19,303.666,205.068,297.071C222.123,294.988,240.14,291.032,258.4,285.1C260.298,284.482,262.182,283.848,264.044,283.192",
        "M187.056,315.417C181.269,311.211,175.826,305.568,170.822,298.724C181.598,299.073,193.096,298.534,205.068,297.071C199.19,303.666,193.16,309.789,187.056,315.417",
        "M287.135,169.233C282.184,164.163,276.577,159.182,270.362,154.363C270.346,145.85,269.265,138.052,267.075,131.201C272.746,130.524,278.303,130.07,283.725,129.826C285.701,142.33,286.878,155.546,287.135,169.233",
        "M270.362,154.363C261.844,147.709,252.191,141.356,241.602,135.477C250.271,133.59,258.792,132.163,267.075,131.201C269.265,138.052,270.346,145.85,270.362,154.363",
        "M227.078,269.269C244.375,269.237,260.001,266.997,273.009,262.703C270.341,270.082,267.343,276.952,264.044,283.192C262.182,283.848,260.298,284.482,258.4,285.1C240.14,291.032,222.123,294.988,205.068,297.071C211.595,289.799,217.937,281.951,224,273.6C225.048,272.16,226.078,270.717,227.078,269.269",
        "M150.344,257.082C177.39,265.389,203.752,269.336,227.078,269.269C226.078,270.717,225.048,272.16,224,273.6C217.937,281.951,211.595,289.799,205.068,297.071C193.096,298.534,181.598,299.073,170.822,298.724C162.702,287.706,155.736,273.527,150.344,257.082",
        "M107.9,100.1C65.96,100.5,34.06,114,26.16,138.5C17.403,165.25,39.631,198.225,79.739,224.535C85.478,213.292,92.285,201.942,100.121,190.751C95.816,162.081,101.236,138.647,117.4,126.9C124.6,121.6,133.5,119.2,143.4,119.2C143.4,119.2,143.4,119.2,143.4,119.2C143.43,119.2,143.459,119.2,143.49,119.203C144.59,113.684,145.859,108.338,147.277,103.178C133.51,100.987,120.271,99.977,107.9,100.1C107.9,100.1,107.9,100.1,107.9,100.1",
        "M79.739,224.535C84.236,227.518,88.989,230.405,93.951,233.189C96.213,226.351,99.922,219.399,104.915,212.496C102.741,204.994,101.127,197.709,100.121,190.751C92.285,201.942,85.478,213.292,79.739,224.535",
        "M139.62,144.942C140.521,136.043,141.826,127.439,143.49,119.203C143.459,119.2,143.43,119.2,143.4,119.2C143.4,119.2,143.4,119.2,143.4,119.2C133.5,119.2,124.6,121.6,117.4,126.9C101.236,138.647,95.816,162.081,100.121,190.751C101.22,189.163,102.35,187.58,103.5,186C114.787,170.454,127.041,156.656,139.62,144.942",
        "M104.915,212.496C112.918,201.425,124.222,190.48,138.149,180.327C138.116,178.56,138.1,176.784,138.1,175C138.1,164.702,138.62,154.646,139.62,144.942C127.041,156.656,114.787,170.454,103.5,186C102.35,187.58,101.22,189.163,100.121,190.751C101.127,197.709,102.741,204.994,104.915,212.496",
        "M294.009,252.36C302.052,246.613,307.732,239.422,310.5,230.9C316.649,211.92,307.326,189.846,287.135,169.233C287.182,171.143,287.2,173.067,287.2,175C287.2,194.213,285.393,212.576,282.097,229.44C286.567,237.109,290.537,244.777,294.009,252.36",
        "M93.951,233.189C101.25,237.297,109.006,241.178,117.164,244.769C112.025,233.76,107.926,222.916,104.915,212.496C99.922,219.399,96.213,226.351,93.951,233.189",
        "M273.009,262.703C281.111,260.045,288.198,256.593,294.009,252.36C290.537,244.777,286.567,237.109,282.097,229.44C279.773,241.351,276.705,252.514,273.009,262.703",
        "M117.164,244.769C126.091,248.717,135.5,252.318,145.3,255.5C146.984,256.049,148.667,256.582,150.344,257.082C143.058,234.921,138.641,208.628,138.149,180.327C124.222,190.48,112.918,201.425,104.915,212.496C107.926,222.916,112.025,233.76,117.164,244.769",
        "M185.756,112.046C172.667,108.098,159.755,105.153,147.277,103.178C145.859,108.338,144.59,113.684,143.49,119.203C150.707,119.254,158.478,120.646,166.609,123.301C173.053,118.933,179.463,115.171,185.756,112.046",
        "M241.602,135.477C226.581,127.129,209.673,119.736,191.4,113.8C189.515,113.193,187.633,112.607,185.756,112.046C179.463,115.171,173.053,118.933,166.609,123.301C179.639,127.486,193.581,134.88,207.58,145.013C209.173,144.462,210.781,143.925,212.4,143.4C222.24,140.187,232.013,137.545,241.602,135.477",
        "M143.49,119.203C141.826,127.439,140.521,136.043,139.62,144.942C148.53,136.64,157.603,129.382,166.609,123.301C158.478,120.646,150.707,119.254,143.49,119.203",
        "M139.62,144.942C138.62,154.646,138.1,164.702,138.1,175C138.1,176.784,138.116,178.56,138.149,180.327C157.026,166.54,180.738,154.213,207.58,145.013C193.581,134.88,179.639,127.486,166.609,123.301C157.603,129.382,148.53,136.64,139.62,144.942",
        "M282.097,229.44C285.393,212.576,287.2,194.213,287.2,175C287.2,173.067,287.182,171.143,287.135,169.233C282.184,164.163,276.577,159.182,270.362,154.363C270.413,168.003,267.727,183.479,262.45,199.856C263.509,201.254,264.559,202.669,265.6,204.1C271.68,212.474,277.193,220.958,282.097,229.44",
        "M270.362,154.363C261.844,147.709,252.191,141.356,241.602,135.477C232.013,137.545,222.24,140.187,212.4,143.4C210.781,143.925,209.173,144.462,207.58,145.013C226.458,158.672,245.441,177.313,262.45,199.856C267.727,183.479,270.413,168.003,270.362,154.363",
        "M227.078,269.269C244.375,269.237,260.001,266.997,273.009,262.703C276.705,252.514,279.773,241.351,282.097,229.44C277.193,220.958,271.68,212.474,265.6,204.1C264.559,202.669,263.509,201.254,262.45,199.856C255.299,222.115,243.373,246.039,227.078,269.269",
        "M150.344,257.082C177.39,265.389,203.752,269.336,227.078,269.269C243.373,246.039,255.299,222.115,262.45,199.856C245.441,177.313,226.458,158.672,207.58,145.013C180.738,154.213,157.026,166.54,138.149,180.327C138.641,208.628,143.058,234.921,150.344,257.082"
    ],
    // coordinates for the labels
    "l1": {
        "x": [194],
        "y": [ 85]
    },
    "l2": {
        "x": [ 40, 355],
        "y": [120, 120]
    },
    "l3": {
        "x": [ 35, 200, 350],
        "y": [130,  30, 130]
    },
    "l4": {
        "x": [ 35, 105, 285, 355],
        "y": [135,  60,  60, 135]
    },
    "l5": {
        "x": [ 35, 213, 340, 300,  65],
        "y": [100,  15, 125, 384, 365]
    }
}



}); // end of $( function() {
