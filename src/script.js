function getCookieValue(key) {
   const b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
   return b ? b.pop() : "{}";
}

function setCookieValue(key, value) {
    let now = new Date();
    let period = new Date(now.getTime()+1*86400000);
    document.cookie=key+"="+value+";expires="+period.toGMTString()+";";
}

function useHighlighting(txt){
	return txt.replaceAll("[", "<i class=\"highlight\">").replaceAll("]", "</i>");
}

function createCourseDom(e){
	var newNode = document.createElement('div');
	newNode.classList.add('course');
	newNode.classList.add('shadow');
	newNode.innerHTML += "<p>Kurs: " + e.meta.id + "</p>";
	newNode.innerHTML += "<h3>" + e.meta.name + "</h3>";
	newNode.addEventListener("click", function(){ showTraining(e.index); }); 
	
	return newNode;
}

function setHeadline(txt){
	let headline = document.getElementById('headline');
	headline.innerHTML = txt;
	document.title = txt;
}

function showOverview(){
	document.getElementById('overview').style.display = "block"; 
	document.getElementById('training').style.display = "none"; 
	let div = document.getElementById('overview');
	
	setHeadline("Alle Kurse");
	
	div.innerHTML = "";
	window.data.forEach((e, index) => {
		e.index = index;
		div.appendChild(createCourseDom(e));
	});
}

function showTraining(courseIndex){
	document.getElementById('training').style.display = "block"; 
	document.getElementById('overview').style.display = "none"; 
	let div = document.getElementById('content');
	let course = window.data[courseIndex];
	
	setHeadline(course.meta.name);
	
	div.innerHTML = "<h3>Hinweise zur Durchführung</h3><ul>";
	course.meta.hints.forEach(e => {
		div.innerHTML += "<li>"+e+"</li>";
	});
	div.innerHTML += "</ul><br/><br/><b>Viel Erfolg</b>";

	let buttons = document.getElementById('buttons');
	buttons.innerHTML = "";
	var newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-home\"></i><br/>Kursauswahl";
	newButton.addEventListener("click", function(){ showOverview(); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-moodle\"></i><br/>Moodle";
	newButton.addEventListener("click", function(){ window.open(course.meta.moodleUrl, '_blank'); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-learning\"></i><br/>Probeklausur";
	newButton.addEventListener("click", function(){ createExam(courseIndex); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-list\"></i><br/>Aufgabenliste";
	newButton.addEventListener("click", function(){ showExerciseList(courseIndex); });
	buttons.appendChild(newButton);
}

function showExerciseList(courseIndex){
	let div = document.getElementById('content');
	let course = window.data[courseIndex];
	
	let resultCookie = null;
	try{
		resultCookie = JSON.parse(getCookieValue(courseIndex+"_Results"));
	}catch (e) {
		resultCookie = null;
	}
	
	div.innerHTML = "";
	course.exercises.forEach(e => {
		let correctCount = 0;
		let wrongCount = 0;
		if(resultCookie != null){
			let questionResults = resultCookie[e.id];
			if(questionResults != undefined){
				correctCount = questionResults.correctCount;
				wrongCount = questionResults.wrongCount;
			}
		}
		
		div.innerHTML += "<div class=\"correctCount\">"+correctCount+"</div><div class=\"wrongCount\">"+wrongCount+"</div>";
		div.innerHTML += "<small>"+e.id + ":</small> <b>"+useHighlighting(e.question)+"</b><br/>";
		e.answers.forEach(a => {
			let checked = a.correct ? "checked" : "";
			div.innerHTML += "<div class=\"inputBox\"><input type=\"checkbox\" " + checked +" disabled readonly/></div>";
			div.innerHTML += "<label>"+useHighlighting(a.answer) + "</label>";
		});
		div.innerHTML += "<br/>";
	});

	let buttons = document.getElementById('buttons');
	buttons.innerHTML = "";
	var newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-home\"></i><br/>Kursauswahl";
	newButton.addEventListener("click", function(){ showOverview(); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-moodle\"></i><br/>Moodle";
	newButton.addEventListener("click", function(){ window.open(course.meta.moodleUrl, '_blank'); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-learning\"></i><br/>Probeklausur";
	newButton.addEventListener("click", function(){ createExam(courseIndex); });
	buttons.appendChild(newButton);
}

function createExam(courseIndex){
	let course = window.data[courseIndex];
	let listCopy = JSON.parse(JSON.stringify(course.exercises));
	
	window.exam = {
		meta : course.meta,
		exercises : [],
		courseIndex : courseIndex,
		currentExerciseIndex : 0,
		visitedExerciseIndex : 0
	};
	
	let i = 0;
	for(i = 0; i < course.meta.questionsPerExam; i++){
		if(listCopy.length <= 0){
			break;
		}
		
		let randomExerciseIndex = Math.floor(Math.random() * listCopy.length);
		let item = listCopy.splice(randomExerciseIndex, 1);
		window.exam.exercises.push(item[0]);
	}
	
	showNextExercise();
}

function showNextExercise(){
	let div = document.getElementById('content');
	let index = window.exam.currentExerciseIndex;
	let meta = window.exam.meta;
	let exercise = window.exam.exercises[index];
	let questionsPerExam = window.exam.exercises.length -1;
	
	if(window.exam.visitedExerciseIndex < index){
		window.exam.visitedExerciseIndex = index;
	}
	
	div.innerHTML = "";
	div.innerHTML += "<small class=\"right\">(Id: "+exercise.id+")</small><br/>";
	div.innerHTML += "<h3>"+useHighlighting(exercise.question)+"</h3>";
	if(exercise.img != undefined && exercise.img != ""){
		div.innerHTML += "<a href=\""+exercise.img+"\" target=\"_blank\"><img src=\""+exercise.img+"\" alt=\"Bild nicht gefunden\"></a>";
	}
	if(exercise.description != undefined && exercise.description != ""){
		div.innerHTML += "<p>"+useHighlighting(exercise.description)+"</p>";
	}
	
	let useCheckboxes = meta.hideSingleChoice;
	if(!useCheckboxes){
		let correctAnswerCount = 0;
		exercise.answers.forEach(e => {
			if(e.correct){
				correctAnswerCount++;
			}
		});
		if(correctAnswerCount > 1){
			useCheckboxes = true;
		}
	}
	
	exercise.answers.forEach((e, i) => {
		let choice = (e.choice != undefined && e.choice);
		
		if(useCheckboxes){
			let box = document.createElement('input');
			box.type = "checkbox";
			box.id = i;
			if(choice){
				box.setAttribute("checked", "checked");
			}
			box.setAttribute("onchange", "updateChoice(this)");
			div.appendChild(box);
			let label = document.createElement('label');
			label.setAttribute("for", i);
			label.innerHTML = " "+useHighlighting(e.answer);
			div.appendChild(label);
			div.innerHTML += "<br/>";
		}else{
			let box = document.createElement('input');
			box.type = "radio";
			box.name = "radio";
			box.id = i;
			if(choice){
				box.setAttribute("checked", "checked");
			}
			box.setAttribute("onchange", "updateChoice(this)");
			div.appendChild(box);
			let label = document.createElement('label');
			label.setAttribute("for", i);
			label.innerHTML = " "+useHighlighting(e.answer);
			div.appendChild(label);
			div.innerHTML += "<br/>";
		}
	});
	
	let buttons = document.getElementById('buttons');
	buttons.innerHTML = "";
	let progress = document.createElement('progress');
	progress.max = questionsPerExam;
	progress.value = window.exam.visitedExerciseIndex;
	buttons.appendChild(progress);
	let newButton = document.createElement('button');
	newButton.disabled = index == 0;
	newButton.innerHTML = "<i class=\"icon-left\"></i><br/>Zurück";
	newButton.addEventListener("click", function(){ window.exam.currentExerciseIndex--; showNextExercise(); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.disabled = index >= questionsPerExam;
	newButton.innerHTML = "<i class=\"icon-right\"></i><br/>Weiter";
	newButton.addEventListener("click", function(){ window.exam.currentExerciseIndex++; showNextExercise(); });
	buttons.appendChild(newButton);
	
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-done\"></i><br/>Abgeben";
	newButton.addEventListener("click", function(){ showResult(); });
	buttons.appendChild(newButton);
}

function updateChoice(e){
	let index = window.exam.currentExerciseIndex;
	let exercise = window.exam.exercises[index];
	let answer = exercise.answers[parseInt(e.id)];
	
	if(e.type == "radio"){
		exercise.answers.forEach(e => {
			e.choice = false;
		});
	}

	answer.choice = e.checked;
}

function showResult(){
	let div = document.getElementById('content');
	let course = window.exam;
	let points = 0;
	
	let resultCookie = null;
	try{
		resultCookie = JSON.parse(getCookieValue(course.courseIndex+"_Results"));
	}catch (e) {
		resultCookie = {};
	}
	
	div.innerHTML = "";
	course.exercises.forEach(e => {
		let isCompletelyCorrect = true;
		let isPartiallyCorrect = false;
		
		if(resultCookie[e.id] == undefined){
			resultCookie[e.id] = {
				correctCount : 0,
				wrongCount : 0
			};
		}
		
		div.innerHTML += "<small>"+e.id + ":</small> <b>"+useHighlighting(e.question)+"</b><br/>";
		e.answers.forEach(a => { 
			let choice = (a.choice != undefined && a.choice);
			let checked = choice ? "checked" : "";
			let correct = (a.correct == choice);
			
			if(!correct){
				isCompletelyCorrect = false;
			}
			if(correct){
				isPartiallyCorrect = true;
			}
			
			div.innerHTML += correct ? "<i class=\"icon-yes check\"></i> " : "<i class=\"icon-no check\"></i> ";
			div.innerHTML += "<input type=\"checkbox\" " + checked +" disabled readonly/>";
			div.innerHTML += "<label>" + useHighlighting(a.answer) + "</label>";
		});
		let newPoints = 0;
		if(!isCompletelyCorrect && !isPartiallyCorrect){
			newPoints = course.meta.pointsForCompletelyWrongAnswer;
			resultCookie[e.id].wrongCount = (resultCookie[e.id].wrongCount + 1);
		}else if(isCompletelyCorrect){
			newPoints = course.meta.pointsForCompletelyCorrectAnswer;
			resultCookie[e.id].correctCount = (resultCookie[e.id].correctCount + 1);
		}else if(isPartiallyCorrect){
			newPoints = course.meta.pointsForPartiallyCorrectAnswer;
			resultCookie[e.id].wrongCount = (resultCookie[e.id].wrongCount + 1);
		}
		points += newPoints;
		div.innerHTML += "<b class=\"right\">"+newPoints+" Punkte</b>";
		div.innerHTML += "<br/><br/>";
	});

	setCookieValue(course.courseIndex+"_Results", JSON.stringify(resultCookie));

	if(points >= course.meta.pointsToPass){
		div.innerHTML = "<center><h3 style=\"color: green;\">Bestanden</h3><small>"+ points +" Punkte</small></center><br/><br/><br/>" + div.innerHTML;
	}else{
		div.innerHTML = "<center><h3 style=\"color: red;\">Nicht Bestanden</h3><small>"+ points +" Punkte</small></center><br/><br/><br/>" + div.innerHTML;
	}

	let buttons = document.getElementById('buttons');
	buttons.innerHTML = "";
	var newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-home\"></i><br/>Kursauswahl";
	newButton.addEventListener("click", function(){ showOverview(); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.innerHTML = "<i class=\"icon-moodle\"></i><br/>Moodle";
	newButton.addEventListener("click", function(){ window.open(course.meta.moodleUrl, '_blank'); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-learning\"></i><br/>Probeklausur";
	newButton.addEventListener("click", function(){ createExam(course.courseIndex); });
	buttons.appendChild(newButton);
	newButton = document.createElement('button');
	newButton.classList.add('right');
	newButton.innerHTML = "<i class=\"icon-list\"></i><br/>Aufgabenliste";
	newButton.addEventListener("click", function(){ showExerciseList(course.courseIndex); });
	buttons.appendChild(newButton);
}

window.onload = function() {
  showOverview();
};



