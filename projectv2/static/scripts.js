// declare constants
const ENTER_KEY = 13;
const FLASH_MS = 400;
const CHECK_MS = 500;
const TIMER_SECS = 11;
const SECS_PER_MIN = 60;
const DONE_MS = 800;
const GREEN = "#518e37";
const BLACK = "#000000";
const RED = "#ad544e";
const DARK_GREY = "#5a4f4e";
const MAX_DIGIT = 10;
$("document").ready(function()
{
	// listen for text from input field 1
	document.getElementById("input1").addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input1")
			}
		})
		
	// listen for text from input field 2
	document.getElementById("input2").addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input2")
			}
		})
		
	// listen for text from input field 3
	document.getElementById("input3").addEventListener('keypress', function(e)
		{
			var key = e.which || e.keyCode;
			if (key === ENTER_KEY)
			{
				saveTodo("input3")
			}
		})
		
	// listen for text from input field 4
	document.getElementById("input4").addEventListener('keypress', function(e)
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
				url: "http://ide50-anyazhang.cs50.io/saveTodo",
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
	document.getElementById("list1").addEventListener('click', clickTodo, false);
	document.getElementById("list2").addEventListener('click', clickTodo, false);
	document.getElementById("list3").addEventListener('click', clickTodo, false);
	document.getElementById("list4").addEventListener('click', clickTodo, false);
	
	// THANK JESUS FOR "T.J." XD adapted from @http://stackoverflow.com/questions/30150347/delete-parent-element-with-javascript
	function clickTodo(e)
	{
		var btn = e.target;
		var buttonclicked = true;
		var listid = btn.parentNode.parentNode.id
		var category = listid.slice(-1)
		
		// check to see if btn (click target) was text (div) w/ only 1 child node or list item w/ multiple
		if (btn.childNodes.length == 1)
		{
			var todo = btn.parentNode.childNodes[1].innerHTML
		}
		else
		{
			var todo = btn.childNodes[1].innerHTML
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
			url: "http://ide50-anyazhang.cs50.io/removeTodo",
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
	var timerdone = false;
	
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
			'<text id="modal-task">Task</text>' + '</div>' + '<div class="inside">' +
			'<div id="modal-stopwatch" class = "main-timer stopwatch">' + '</div>' +
			'<div id="time-btns">' +
			'<button class="btn time-btn start" style="background-color: #7f5e5b">Start</button>' +
			'<button class="btn time-btn stop" style="background-color: #ad544e; margin-left: 5px; margin-right: 5px">Stop</button>' +
			'<button class="btn time-btn reset-btn" style="background-color: #cc9692">Reset</button>' +
			'</div>' +
			'<text class="modal-text"><img src="https://i.imgsafe.org/914b1905d8.png" style="height: 35px; margin-right: 7px"/>Pomodoros: </text>' +
			'<input class="form-control" type="text" placeholder="#" id="time-input" type="number">' +
			'</div>' + '</div>');
		main.appendChild(div);
		
		// update task title
		document.getElementById("modal-task").innerHTML = todo;
		
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
			url: "http://ide50-anyazhang.cs50.io/getTime",
			data: parameters,
			success: function(data)
			{
				var pomodoros = data[0]["pomodoros"];
				console.log(pomodoros)
				document.getElementById("time-input").value = pomodoros;
			}
		});
		
		// display modal 
		document.getElementById('modal').style.display = "block";
		
		// update pomodoros from input field
		// listen for text from input field
		document.getElementById("time-input").addEventListener('keypress', function(
				e)
			{
				var key = e.which || e.keyCode;
				var pomodoros = document.getElementById("time-input").value;
				if (key === ENTER_KEY && pomodoros != '')
				{
				    // update
					updateTime(todo, category, pomodoros)
                    
                    // flash green
					function changeColor(color)
					{
						document.getElementById("time-input").style.color = color;
					}
					changeColor(GREEN);
					setTimeout(function()
					{
						changeColor(BLACK)
					}, FLASH_MS);
				}
			})
		
		// When the user clicks on (x), close the modal & reset timer
		document.getElementById("modal-close").addEventListener('click', function()
			{
				$("#modal").remove();
				$(".main-timer.stopwatch").TimeCircles().reset();
				$(".main-timer.stopwatch").TimeCircles().destroy();
			})
		
		// function to wait to make sure previous timer done before showing next
		// adapted from http://stackoverflow.com/questions/8896327/jquery-wait-delay-1-second-without-executing-code
		function check()
		{
			if (timerdone != true)
			{
				setTimeout(check, CHECK_MS)
				console.log("waiting")
			}
			else
			{
				console.log("next timer");
				timerdone = false;
				
				// change remaining pomodoros #, recursive call 
				if (document.getElementById("time-input").value > 0)
				{
					document.getElementById("time-input").value -= 1;
					updateTime(todo, category, document.getElementById("time-input").value)
					check();
				}
			}
		};
		
		// show first timer
		timer(TIMER_SECS, RED);
		console.log("timer shown");
		check();
	}
	
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
			url: "http://ide50-anyazhang.cs50.io/updateTime",
			data: parameters,
			success: function()
			{
				console.log("success")
			}
		})
	}
	
	// timer setup
	// adapted from TimeCircles documentation
	function timer(duration, color)
	{
		$(".main-timer.stopwatch").TimeCircles().destroy();
		var className = ".main-timer.stopwatch"
		
		// configure for color/length
		var div = document.getElementById("modal-stopwatch");
		div.setAttribute("data-timer", duration);
		
		// instantiate timecircle JS
		$(className).TimeCircles(
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
			start: false
		});
		$(className).TimeCircles().reset();
		
		// Show minutes and seconds in single circle
		// Creds @stackoverflow.com/questions/25264887/jquery-timecircles-display-minutes-and-seconds-in-one-circle
		var newClass = className.concat(" .textDiv_Minutes");
		var $container = $(newClass);
		$container.find('h4').text('Time left');
		var $original = $container.find('span');
		var $clone = $original.clone().appendTo($container);
		$original.hide();
		$(className).TimeCircles().addListener(function(unit, value, total)
		{
			total = Math.abs(total);
			var minutes = Math.floor(total / SECS_PER_MIN) % SECS_PER_MIN;
			var seconds = total % SECS_PER_MIN;
			if (seconds < MAX_DIGIT) seconds = "0" + seconds;
			$clone.text(minutes + ':' + seconds);
		}, "all");
		$(className).TimeCircles().addListener(function(unit, value, total)
		{
			if (total == 0)
			{
				// timeout, since TimeCircles usually stops a second early 
				setTimeout(done, DONE_MS);
			}
		}, "all");
		
		// steps to take after timer concludes
		function done()
		{
			$(".main-timer.stopwatch").TimeCircles().reset()
			$(".main-timer.stopwatch").TimeCircles().stop()
			timerdone = true;
			console.log("timer1 done")
			document.getElementById("alarm").play();
		}
		
		// button functionality
		$(".start").click(function()
		{
			$(className).TimeCircles().start();
		});
		$(".stop").click(function()
		{
			$(className).TimeCircles().stop();
		});
		$(".reset-btn").click(function()
		{
			$(className).TimeCircles().reset();
		});
	}
});
