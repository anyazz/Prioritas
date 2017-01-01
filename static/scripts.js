// declare constants
const ENTER_KEY = 13;
const FLASH_MS = 400;
const CHECK_MS = 100;
const TIMER_SECS =11;
const BREAK_SECS=6;
const SECS_PER_MIN = 60;
const DONE_MS = 1000;
const GREEN = "#518e37";
const BLACK = "#000000";
const RED = "#ad544e";
const DARK_GREY = "#5a4f4e";
const MAX_DIGIT = 10;


$("document").ready(function()
{
	// listen for text from input field 1
	$("#input1")[0].addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input1")
			}
		})
		
	// listen for text from input field 2
	$("#input2")[0].addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input2")
			}
		})
		
	// listen for text from input field 3
	$("#input3")[0].addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input3")
			}
		})
		
	// listen for text from input field 4
	$("#input4")[0].addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input4")
			}
		})
		
	// save input field text to SQL table
	function saveTodo(input)
	{
		var todo = document.getElementById(input).value
		
		// make sure todo isn't empty
		if (todo != "")
		{
		    
			// get list name as string
			var category = input.slice(-1)
			var list = "list"
			list = list.concat(category)
			var parameters = {
					todo: todo,
					category: category
				}
				
			// call Python saveTodo function; if successful, add to table
			$.ajax(
			{
				url: Flask.url_for("saveTodo"),
				data: parameters,
				success: function()
				{
					addTodo(list, input);
				}
			});
		}
		false;
	}
	
	// add input field text to in-app list
	function addTodo(list, input)
	{
		var ul = document.getElementById(list);
		var li = document.createElement('li');
		var div = document.createElement('div')
		var todo = document.getElementById(input).value;
		var linkText = document.createTextNode(todo);
		li.setAttribute("class", "list-group-item list-group-item-action");
		li.innerHTML = li.innerHTML + '<button class="delete">X</button>';
		div.appendChild(linkText);
		li.appendChild(div);
		ul.appendChild(li);
		document.getElementById(input).value = '';
	}
	
	// call clickTodo when any list clicked
	$("#list1")[0].addEventListener('click', clickTodo, false);
	$("#list2")[0].addEventListener('click', clickTodo, false);
	$("#list3")[0].addEventListener('click', clickTodo, false);
	$("#list4")[0].addEventListener('click', clickTodo, false);
	
	// THANK JESUS FOR "T.J." XD adapted from @http://stackoverflow.com/questions/30150347/delete-parent-element-with-javascript
	function clickTodo(e)
	{
		var btn = e.target;
		var buttonclicked = true;
		
		// check to see if btn (click target) was text (div) w/ only 1 child node or list item w/ multiple
		if (btn.childNodes.length == 1)
		{
			var todo = btn.parentNode.childNodes[1].innerHTML
			var listid = btn.parentNode.parentNode.id
			var listid = btn.parentNode.parentNode.id
			var category = listid.slice(-1)
		}
		else
		{
			var todo = btn.childNodes[1].innerHTML
			var listid = btn.parentNode.id
			var category = listid.slice(-1)
		}
		
		// start with the element that was the target of the
		// event and look to see if any the event passed through
		// a `button class="delete"` on its way to the list.
		while (btn && (btn.tagName != "BUTTON" || !/\bdelete\b/.test(btn.className)))
		{
			btn = btn.parentNode;
			if (btn === this)
			{
				buttonclicked = false;
			}
		}
		
		// if delete button clicked, remove list item
		if (buttonclicked)
		{
			removeTodo(todo, category, btn)
		}
		
		// else if anywhere else on list item clicked, show pop-up
		else
		{
			showModal(todo, category);
		}
	}
	
	// function to delete todos from SQL table and in-app list
	function removeTodo(todo, category, btn)
	{
		var parameters = {
				todo: todo,
				category: category
			}
		
		// call python function to remove from SQL       
		$.ajax(
		{
			url: Flask.url_for("removeTodo"),
			data: parameters,
			success: function()
			{
				// remove from HTML list
				btn.parentNode.remove();
			},
			error: function()
			{
				console.log("fail:(");
			}
		});
	}
	var work_done = false;
	var break_done = false;

	// steps to take after timer concludes
	function workdone()
	{
		work_done = true;
		console.log("timer done")
		$("#alarm")[0].play();

	}

	function breakdone()
	{
		console.log("break done");
		break_done = true;
		$("#alarm")[0].play();
	}

	// Adapted from http://www.w3schools.com/howto/howto_css_modals.asp
	function showModal(todo, category)
	{
		// generate timer HTML
		var main = document.getElementById("main-html");
		var div = document.createElement("div");
		div.setAttribute("id", "modal");
		div.setAttribute("class", "modal");
		div.innerHTML += ('<div class="modal-box flexContainer">' +
			'<span id="modal-close">x</span>' + '<div id="tasks">' +
			'<text id="modal-task">Task</text>' + '</div>' + '<div class="inside">' + '<div class = "timers">' +
			'<div id="work-timer" class = "main-timer">' + '</div>' +
			'<div id="break-timer" class = "main-timer">' + '</div>' + '</div>' +
			'<div id = "work-btns" class="time-btns">' +
			'<button class="btn time-btn" id="work-start" style="background-color: #7f5e5b">Start</button>' +
			'<button class="btn time-btn" id="work-stop" style="background-color: #ad544e; margin-left: 5px; margin-right: 5px">Stop</button>' +
			'<button class="btn time-btn" id="work-reset" style="background-color: #cc9692">Reset</button>' +
			'</div>' +
			'<div id = "break-btns" class="time-btns">' +
			'<button class="btn time-btn" id="break-start" style="background-color: #7f5e5b">Start</button>' +
			'<button class="btn time-btn" id="break-stop" style="background-color: #ad544e; margin-left: 5px; margin-right: 5px">Stop</button>' +
			'<button class="btn time-btn" id="break-reset" style="background-color: #cc9692">Reset</button>' +
			'</div>' +
			'<text class="modal-text"><img src="static/pomodoro.png" style="height: 35px; margin-right: 7px"/>Pomodoros: </text>' +
			'<input class="form-control" type="text" placeholder="#" id="time-input" type="number">' +
			'</div>' + '</div>');
		main.appendChild(div);
		
		// update task title
		$("#modal-task")[0].innerHTML = todo;
		
		// config Timer & load default pomodoro value from SQL
		var parameters = {
			todo: todo,
			category: category,
		}
		console.log("showing modal")
		// get number of pomodoros from SQL table for todo
		$.ajax(
		{
			async: false,
			url: Flask.url_for("getTime"),
			data: parameters,
			success: function(data)
			{
				var pomodoros = data[0]["pomodoros"];
				console.log(pomodoros)
				$("#time-input")[0].value = pomodoros;
			}
		});
		
		// display modal 
		$("#modal")[0].style.display = "block";
		
		// update pomodoros from input field
		// listen for text from input field
		$("#time-input")[0].addEventListener('keypress', function(
				e)
			{
				var key = e.which || e.keyCode;
				var pomodoros = $("#time-input")[0].value;
				if (key === ENTER_KEY && pomodoros != '')
				{
				    // update
					updateTime(todo, category, pomodoros)
                    
                    // flash green
					function changeColor(color)
					{
						$("#time-input")[0].style.color = color;
					}
					changeColor(GREEN);
					setTimeout(function()
					{
						changeColor(BLACK)
					}, FLASH_MS);
				}
			})
		
		// When the user clicks on (x), close the modal & reset timer
		$("#modal-close")[0].addEventListener('click', function()
			{
				$("#modal").remove();
				$("#work-timer").TimeCircles().destroy();
				$("#break-timer").TimeCircles().destroy();
			})
		
		// instantiate work timer
		timer("#work", workdone, TIMER_SECS, RED, false);
		
		// instantiate break timer
		timer("#break", breakdone, BREAK_SECS, GREEN, false);
		startPomodoro(todo, category)
	}
	
	function startPomodoro(todo, category)
	{
		$("#work-timer").TimeCircles().restart();
		$("#work-timer").TimeCircles().stop();
		$("#work-timer").show();
		$("#work-btns").show();
		$("#break-timer").hide();
		$("#break-btns").hide();
		console.log("pomodoro started");
		workcheck(todo, category);
	}
	
	// wait function to make sure previous timer done before showing next
		// adapted from http://stackoverflow.com/questions/8896327/jquery-wait-delay-1-second-without-executing-code
	function workcheck(todo, category)
	{
		if (work_done != true)
		{
			setTimeout(function() {workcheck(todo, category)}, CHECK_MS)
			console.log("waiting1")
		}
		else
		{
			work_done = false;
			console.log("break timer");
			$("#work-timer").hide();
			$("#work-btns").hide();
			$("#break-timer").show();
			$("#break-btns").show();
			$("#break-timer").TimeCircles().restart();
			breakcheck(todo, category);
		}
	};

	function breakcheck(todo, category)
	{
		if (break_done != true)
		{
			setTimeout(function() {breakcheck(todo, category)}, CHECK_MS)
			console.log("waiting2")
		}
		else
		{
			break_done = false;
			if ($("#time-input")[0].value > 0) 
			{
				console.log(todo)
				console.log(category)
				$("#time-input")[0].value -= 1;
				updateTime(todo, category, $("#time-input")[0].value);
				$("#work-timer").TimeCircles().restart();
				startPomodoro(todo, category);
			}
		}
	};
		
	// function to update number of pomodoros in SQL table
	function updateTime(todo, category, pomodoros)
	{
		var parameters = {
			todo: todo,
			category: category,
			pomodoros: pomodoros
		}
		$.ajax(
		{
			url: Flask.url_for("updateTime"),
			data: parameters,
			success: function()
			{
				console.log("success")
			}
		})
	}
	
	// timer setup
	// adapted from TimeCircles documentation
	function timer(timer_name, done_func, duration, color, start_bool)
	{	
		var timer_id = timer_name.concat("-timer")
		// configure for color/length
		var div = $(timer_id)[0];
		div.setAttribute("data-timer", duration);
		
		// instantiate timecircle JS
		$(timer_id).TimeCircles(
		{
			animation: "smooth",
			bg_width: 1.2,
			fg_width: 0.1,
			circle_bg_color: DARK_GREY,
			total_duration: duration,
			count_past_zero: false,
			time:
			{
				Days:
				{
					show: false
				},
				Hours:
				{
					show: false
				},
				Seconds:
				{
					show: false
				},
				Minutes:
				{
					color: color
				},
			},
			start: start_bool
		});
		
		// Show minutes and seconds in single circle
		// Creds @stackoverflow.com/questions/25264887/jquery-timecircles-display-minutes-and-seconds-in-one-circle
		var newClass = timer_id.concat(" .textDiv_Minutes");
		var $container = $(newClass);
		$container.find('h4').text('Time left');
		var $original = $container.find('span');
		var $clone = $original.clone().appendTo($container);
		$original.hide();
		$(timer_id).TimeCircles().addListener(function(unit, value, total)
		{
			total = Math.abs(total);
			var minutes = Math.floor(total / SECS_PER_MIN) % SECS_PER_MIN;
			var seconds = total % SECS_PER_MIN;
			if (seconds < MAX_DIGIT) seconds = "0" + seconds;
			$clone.text(minutes + ':' + seconds);
		}, "all");
		
		$(timer_id).TimeCircles().addListener(function(unit, value, total)
		{
			if (total == 0)
			{
				// timeout, since TimeCircles usually stops a second early 
				setTimeout(done_func, DONE_MS);
			}
		}, "all");
		
		var start_id = timer_name.concat("-start");
		var stop_id = timer_name.concat("-stop");
		var reset_id = timer_name.concat("-reset");
		// button functionality
		$(start_id).click(function()
		{
			$(timer_id).TimeCircles().start();
		});
		$(stop_id).click(function()
		{
			$(timer_id).TimeCircles().stop();
		});
		$(reset_id).click(function()
		{
			$("#work-timer").TimeCircles().restart();
			$("#work-timer").TimeCircles().stop();
			work_done = false;
			startPomodoro();
		});
	}
});
