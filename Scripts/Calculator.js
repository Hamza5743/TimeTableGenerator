function ProduceTimeTable() {
  var HtmlCourses = document.getElementsByClassName("CourseName");
  var CourseSections = ExtractSections();
  var allowedPeriods = ExtractAllowedTimes();
  var CourseNames = [];
  var NumCourses = 0;

  for (let i = 0; i < HtmlCourses.length; i++) {
    CourseNames.push(HtmlCourses[i].value);
    if (
      CourseSections[i].length != 0 &&
      HtmlCourses[i].value != "Please Select a Course."
    ) {
      NumCourses++;
    }
  }

  var filtered = filter(CourseNames, CourseSections, allowedPeriods);

  var Pdiv = document.getElementById("Output");
  var Ediv = document.getElementById("Error");

  Pdiv.innerHTML = "";
  Ediv.innerHTML = "";
  if (filtered.length < NumCourses || NumCourses == 0) {
    var Error = document.createElement("h3");
    Error.innerHTML = "No Suitable TimeTable Found!";

    Ediv.appendChild(Error);
  } else {
    var TimeTable = [];
    for (let i = 0; i < 6; i++) {
      TimeTable.push(["-", "-", "-", "-", "-", "-", "-", "-"]);
    }

    GenerateTable(filtered, 0, TimeTable);
    var Error = document.createElement("h3");
    if (Pdiv.childElementCount == 0) {
      Error.innerHTML = "No Suitable TimeTable Found!";
    } else {
      Error.innerHTML = "Generated Scoll Down!";
    }
    Ediv.appendChild(Error);
  }
}

function ExtractAllowedTimes() {
  var AllowedPeriods = [];
  for (let i = 0; i < 6; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      row.push(document.getElementById(String(i) + String(j)).checked);
    }
    AllowedPeriods.push(row);
  }
  return AllowedPeriods;
}

function SameCourses(c1, c2) {
  return c1.includes(c2) || c2.includes(c1);
}

function SameSection(sections, s) {
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].substring(0, 6) == s.substring(0, 6)) {
      return true;
    }
  }
  return false;
}

function filter(courseNames, sections, allowedPeriods) {
  var currentCourse = [];
  var filtered = [];
  for (let i = 0; i < Courses.length; ) {
    var iterate = true;
    for (let j = 0; j < 5; j++) {
      var previousSection;
      var currentSection = [];
      if (
        i < Courses.length &&
        Courses[i][0] == courseNames[j] &&
        SameSection(sections[j], Courses[i][1])
      ) {
        previousSection = Courses[i][1].substring(0, 6);
        while (
          i < Courses.length &&
          SameCourses(Courses[i][0], courseNames[j])
        ) {
          var stime = Math.floor(parseInt(Courses[i][2]) / 90);
          var etime = Math.ceil(parseInt(Courses[i][3]) / 90);
          var allowed = true;
          if (
            previousSection != Courses[i][1].substring(0, 6) &&
            currentSection.length != 0
          ) {
            previousSection = Courses[i][1].substring(0, 6);
            currentCourse.push(currentSection);
            currentSection = [];
          }
          if (SameSection(sections[j], Courses[i][1]) == false) {
            allowed = false;
          }
          for (let k = stime; k < etime; k++) {
            if (
              allowedPeriods[parseInt(Courses[i][4])][k] == false ||
              allowed == false
            ) {
              var wrongSection = Courses[i][1].substring(0, 6);
              allowed = false;
              currentSection = [];
              while (
                i < Courses.length &&
                SameCourses(Courses[i][0], courseNames[j]) &&
                Courses[i][1].substring(0, 6) == wrongSection
              ) {
                i++;
              }
              previousSection = Courses[i][1].substring(0, 6);
              i--;
              break;
            }
          }
          if (allowed) {
            currentSection.push(Courses[i]);
          }
          iterate = false;
          i++;
        }
        if (currentSection.length != 0) {
          currentCourse.push(currentSection);
        }
        if (currentCourse.length != 0) {
          filtered.push(currentCourse);
          currentCourse = [];
        }
      }
    }
    if (iterate) {
      i++;
    }
  }

  return filtered;
}

function PrintTable(TimeTable) {
  var Pdiv = document.getElementById("Output");
  var Table = document.createElement("table");
  Table.className = "table table-bordered";
  Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  Timings = [
    "",
    "8.30-10.00",
    "10.00-11.30",
    "11.30-1.00",
    "1.00-2.30",
    "2.30-4.00",
    "4.00-5.30",
    "5.30-7.00",
    "7.00-8.30",
  ];
  var head = Table.createTHead();
  head.className = "thead-dark";
  var hrow = head.insertRow();
  for (let j = 0; j < 9; j++) {
    var hcell = document.createElement("th");
    hcell.innerHTML = Timings[j];
    hrow.appendChild(hcell);
  }
  var body = Table.createTBody();
  for (let i = 0; i < 6; i++) {
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

function GenerateTable(Filtered, Depth, TimeTable) {
  if (Depth == Filtered.length) {
    PrintTable(TimeTable);
    return;
  }
  for (let i = 0; i < Filtered[Depth].length; i++) {
    let clash = false;
    for (let j = 0; j < Filtered[Depth][i].length; j++) {
      var stime = Math.floor(parseInt(Filtered[Depth][i][j][2]) / 90);
      var etime = Math.ceil(parseInt(Filtered[Depth][i][j][3]) / 90);
      for (let k = stime; k < etime; k++) {
        if (TimeTable[parseInt(Filtered[Depth][i][j][4])][k] == "-") {
          TimeTable[parseInt(Filtered[Depth][i][j][4])][k] =
            Filtered[Depth][i][j][0] +
            "\n" +
            Filtered[Depth][i][j][1] +
            "\n" +
            Filtered[Depth][i][j][5];
        } else {
          clash = true;
        }
      }
    }
    if (clash == false) {
      GenerateTable(Filtered, Depth + 1, TimeTable);
    }
    for (let j = 0; j < Filtered[Depth][i].length; j++) {
      var stime = Math.floor(parseInt(Filtered[Depth][i][j][2]) / 90);
      var etime = Math.ceil(parseInt(Filtered[Depth][i][j][3]) / 90);

      for (let k = stime; k < etime; k++) {
        if (
          TimeTable[parseInt(Filtered[Depth][i][j][4])][k] ==
          Filtered[Depth][i][j][0] +
            "\n" +
            Filtered[Depth][i][j][1] +
            "\n" +
            Filtered[Depth][i][j][5]
        ) {
          TimeTable[parseInt(Filtered[Depth][i][j][4])][k] = "-";
        }
      }
    }
  }
}

function ExtractSections() {
  var checkedSections = [];
  for (let i = 1; i < 6; i++) {
    var sections = document.getElementsByClassName("c" + i + "s");
    var secs = [];
    for (let check of sections) {
      if (check.checked) {
        secs.push(check.name);
      }
    }
    checkedSections.push(secs);
  }
  return checkedSections;
}

function AddSections(Course) {
  var table = document.getElementById(Course.className.split(" ")[1]);
  var first = table.firstElementChild;
  while (first) {
    first.remove();
    first = table.firstElementChild;
  }
  prev = "";
  var counter = 5;
  var currentRow;
  Courses.forEach((period) => {
    var section = period[1];
    if (period[0] == Course.value && section != prev) {
      if (counter >= 4) {
        var row = document.createElement("div");
        row.className = "list-group list-group-horizontal-sm flex-fill";
        row.style = "margin-bottom: 0px;";
        table.appendChild(row);
        currentRow = row;
        counter = 0;
      }
      var label = document.createElement("label");
      label.className = "list-group-item";
      label.style = "margin-bottom: 0px; min-width: 25%";
      var check = document.createElement("input");
      check.type = "checkbox";
      check.className = "form-check-input me-1 " + table.id + "s";
      check.value = "";
      check.style = "margin-left: auto; position: static;";
      document.getElementById("rad1").checked
        ? (check.defaultChecked = true)
        : (check.defaultChecked = false);
      check.name = section;
      label.appendChild(check);
      label.innerHTML += "\n&nbsp&nbsp&nbsp" + section;
      currentRow.appendChild(label);
      prev = section;
      counter += 1;
    }
  });
}

function ToggleRow(check) {
  var row = check.id[1];
  for (let i = 0; i < 8; i++) {
    var box = document.getElementById(row + i);
    box.checked = check.checked;
  }
}

function ToggleCol(check) {
  var col = check.id[1];
  for (let i = 0; i < 6; i++) {
    var box = document.getElementById(i + col);
    box.checked = check.checked;
  }
}

window.onload = function AddCourseSelection() {
  var select = document.getElementsByClassName("CourseName");
  for (let i = 0; i < select.length; i++) {
    prev = "";
    Courses.forEach((element) => {
      var Course = element[0];
      if (Course != prev && Course.includes("Lab") != true) {
        var option = document.createElement("option");
        option.value = Course;
        option.text = Course;
        select[i].appendChild(option);
        prev = Course;
      }
    });
  }
};
