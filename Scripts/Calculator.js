function filter(CourseNames, Sections, AllowedPeriods){
    let iterations = Courses.length;
    var preci = -1;
    var presi = -1;
    CourseSectionsSort = [];
    CourseTypeSort = [];
    Filtered = [];
    BannedCourse = "0000000";
    BannedSection = "0000000";
    for (let i = 0; i < iterations; i++) {
        var csvs = Courses[i].split("|");
        var tvalid = true;
        var stime = Math.floor(csvs[2]/90);
        var etime = Math.ceil(csvs[3]/90);
        if ((BannedCourse.includes(csvs[0]) || csvs[0].includes(BannedCourse)) && (BannedSection.includes(csvs[1]) || csvs[1].includes(BannedSection))){
            tvalid = false;
        }
        for (let j = stime; j < etime; j++) {
            if (AllowedPeriods[csvs[4]][j] == false){
                tvalid = false;
                BannedCourse = csvs[0];
                BannedSection = csvs[1];
                if (preci != -1){
                    if ((CourseNames[preci].includes(csvs[0]) || csvs[0].includes(CourseNames[preci])) && (Sections[preci].split("|")[presi].includes(csvs[1]) || csvs[1].includes(Sections[preci].split("|")[presi]))){
                        CourseSectionsSort = ["Banned"];
                    }
                }
            }
        }
        if (tvalid == true){
            for (let j = 0; j < CourseNames.length; j++) {
                if (csvs[0].includes(CourseNames[j])) {
                    IndividualSections = Sections[j].split("|");
                    for (let k = 0; k < IndividualSections.length; k++) {
                        if (csvs[1].includes(IndividualSections[k])){
                            if (CourseSectionsSort.length == 0 && CourseTypeSort.length == 0 && Filtered.length == 0){
                                CourseSectionsSort.push(Courses[i]);
                            }
                            else if (CourseSectionsSort[0] == "Banned"){
                                if (preci != j || presi != k){
                                    CourseSectionsSort = [];
                                    CourseSectionsSort.push(Courses[i]);
                                }
                            }
                            else{
                                if (preci == j){
                                    if (presi == k){
                                        CourseSectionsSort.push(Courses[i]);
                                    }
                                    else{
                                        CourseTypeSort.push(CourseSectionsSort);
                                        CourseSectionsSort = [];
                                        CourseSectionsSort.push(Courses[i]);
                                    }
                                }
                                else{
                                    CourseTypeSort.push(CourseSectionsSort);
                                    Filtered.push(CourseTypeSort);
                                    CourseTypeSort = [];
                                    CourseSectionsSort = [];
                                    CourseSectionsSort.push(Courses[i]);
                                }
                            }
                            preci = j;
                            presi = k;
                        }
                    }
                }
            }
        }
    }
    if (CourseSectionsSort.length != 0 && CourseSectionsSort[0] != "Banned"){
        CourseTypeSort.push(CourseSectionsSort);
        Filtered.push(CourseTypeSort);
    }
    return Filtered;
}

function PrintTable(TimeTable){
    var Pdiv = document.getElementById("Output");
    var Table = document.createElement("table");
    Table.className = "table table-bordered";
    Days = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
    Timings = ["","8.00-9.30","9.30-11.00","11.00-12.30","12.30-2.00","2.00-3.30","3.30-5.00","5.00-6.30","6.30-8.00"]
    var head = Table.createTHead();
    head.className = "thead-dark";
    var hrow = head.insertRow();
    for (let j = 0; j < 9; j++) {
        var hcell = document.createElement("th");
        hcell.innerHTML = Timings[j];
        hrow.appendChild(hcell);
    }
    var body = Table.createTBody();
    for (let i = 0; i < 5; i++) {
        var row = body.insertRow();
        hcell = document.createElement("th");
        hcell.innerHTML = Days[i];
        row.appendChild(hcell);
        for (let j = 0; j < 8; j++) {
            var cell = row.insertCell();
            cell.innerHTML = TimeTable[i][j];
        }
    }
    Pdiv.appendChild(Table);
    var htbr = document.createElement("br");
    Pdiv.appendChild(htbr);
}

function GenerateTable(Filtered, Depth, TimeTable){
    if (Depth == Filtered.length){
        PrintTable(TimeTable);
        return;
    }
    for (let i = 0; i < Filtered[Depth].length; i++) {
        let clash = false;
        for (let j = 0; j < Filtered[Depth][i].length; j++) {
            var csvs = Filtered[Depth][i][j].split("|");
            var stime = Math.floor(csvs[2]/90);
            var etime = Math.ceil(csvs[3]/90);
            for (let k = stime; k < etime; k++) {
                if (TimeTable[csvs[4]][k] == "-"){
                    TimeTable[csvs[4]][k] = csvs[0] + " " + csvs[1] + " " + csvs[5];
                }
                else{
                    clash = true;
                }
            }
        }
        if (clash == false){
            GenerateTable(Filtered, Depth + 1, TimeTable);
        }
        for (let j = 0; j < Filtered[Depth][i].length; j++) {
            var csvs = Filtered[Depth][i][j].split("|");
            var stime = Math.floor(csvs[2]/90);
            var etime = Math.ceil(csvs[3]/90);
            for (let k = stime; k < etime; k++) {
                if (TimeTable[csvs[4]][k] == csvs[0] + " " + csvs[1] + " " + csvs[5]){
                    TimeTable[csvs[4]][k] = "-";
                }
            }
        }
    }
}

function ProduceTimeTable(){
    var Pdiv = document.getElementById("Output");
    var Ediv = document.getElementById("Error");
    Pdiv.innerHTML = "";
    Ediv.innerHTML = "";
    var AllowedPeriods = [];
    for (let i = 0; i < 5; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            row.push(document.getElementById(String(i) + String(j)).checked);
        }
        AllowedPeriods.push(row);
    }
    var HtmlCourses = document.getElementsByClassName("CourseName");
    var HtmlSections = document.getElementsByClassName("CourseSection");
    CourseNames = [];
    CourseSections = [];
    var NumCourses = 0;
    for (let i = 0; i < HtmlCourses.length; i++) {
        CourseNames.push(HtmlCourses[i].value);
        CourseSections.push(HtmlSections[i].value);
        if (HtmlSections[i].value != "" && HtmlCourses[i].value != "Please Select a Course."){
            NumCourses++;
        }
    }
    Filtered = filter(CourseNames, CourseSections, AllowedPeriods);
    if (Filtered.length < NumCourses){
        var Pdiv = document.getElementById("Error");
        var Error = document.createElement("h3");
        Error.innerHTML = "No Suitable TimeTable Found!";
        Pdiv.appendChild(Error);
    }
    else{
        TimeTable = [];
        for (let i = 0; i < 5; i++) {
            TimeTable.push(["-","-","-","-","-","-","-","-"]);
        }
        GenerateTable(Filtered, 0, TimeTable);
        var Ediv = document.getElementById("Error");
        var Pdiv = document.getElementById("Output");
        var Error = document.createElement("h3");
        if (Pdiv.childElementCount == 0){
            Error.innerHTML = "No Suitable TimeTable Found!";
        }
        else{
            Error.innerHTML = "Generated Scoll Down!";
        }
        Ediv.appendChild(Error);
    }
}

function AddCourseSelection(){
    var select = document.getElementsByClassName("CourseName");
    for (let i = 0; i < select.length; i++) {
        prev = "";
        Courses.forEach(element => {
            var csvs = element.split("|");
            if (csvs[0] != prev && csvs[0].includes("Lab") != true){
                var option = document.createElement("option");
                option.value = csvs[0];
                option.text = csvs[0];
                select[i].appendChild(option);
                prev = csvs[0];
            }
        });
    }
}

function AddSections(Course){
    var cclass = Course.className;
    cclass = cclass.split(" ")[1];
    var select = document.getElementById(cclass);
    var tbox = document.getElementById("s" + cclass[1]);
    tbox.value = "";
    for (let i = select.length - 1; i > 0; i--) {
        select.remove(i);
    }
    prev = "";
    Courses.forEach(element => {
        var csvs = element.split("|");
        if (csvs[0] == Course.value && csvs[1] != prev){
            var option = document.createElement("option");
            option.value = csvs[1];
            option.text = csvs[1];
            select.appendChild(option);
            prev = csvs[1];
        }
    });
}

function AddToText(Select){
    var sid = Select.getAttribute('id');
    var tbox = document.getElementById("s" + sid[1]);
    for (let i = Select.length - 1; i >= 0; i--) {
        if (Select[i].selected == true){
            if (tbox.value == ""){
                tbox.value = Select[i].value;
            }
            else{
                tbox.value = tbox.value + "|" + Select[i].value;
            }
            Select.remove(i);
        }
    }
}
