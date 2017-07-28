//always check local storage for an existing calendar before initializing a new empty one
calendar = jQuery.parseJSON(localStorage.getItem('calendar'));
if (!calendar) {
	calendar = [];
}

//setup bootstrap pickers on document ready
$(function() {
	var pathname = location.pathname;
	//only fire on /new view
	if (pathname.indexOf("/new") >= 0) {
		$('#datepicker').datepicker({
			autoclose: true
		});
		$('#start_timepicker').timepicker();
		$('#end_timepicker').timepicker();
	//only fire on /index view
	} else if (pathname.indexOf("/index") >= 0) {
		// datepicker
		$('#displaydatepicker').datepicker({
			autoclose: true
		}).on('changeDate', function () {
			var lookup_date = $('#displaydatepicker').data('datepicker').getFormattedDate('yyyy-mm-dd');
			hideShowByDate(lookup_date);
		}).on('clearDate', function () {
			$('.list-items').each(function() {
				$(this).show();
			});
		});
		// /datepicker
		$calendar_list = $('#calendar_list');
		if (calendar.length === 0) {
			$calendar_list.append("<li>There are currently no reservations.</li>");
		} else {
			calendar.forEach(function(r) {
				var message = (r.message !== "") ? (" (" + r.message + ")") : "";
				var reservation_string = "Reservation on " + r.date + " from " + IntegerToTime(r.start) + " - " + IntegerToTime(r.end) + message;
				var li = "<li class='list-items' id='" + r.id + "' onclick='showSlider(this);'>" + reservation_string + "</li>";
				$calendar_list.append(li);
			});
		}
	}
});

//show fake modal slider on list-item click
function showSlider(li) {
	id = $(li).attr('id');
	calendar.forEach(function(r) {
		if (r.id == id) {
			var overlay = $('<div id="overlay"></div>');
			overlay.appendTo(document.body);
			$('#reservation_id').val(id);
			$('#slider-date').text("Editing: " + r.date);
			$('.slider').stop().animate({
				left: 350    
			}, 200);
			$('#start_timepicker').timepicker();
			$('#end_timepicker').timepicker();
			$('#start_timepicker').val(IntegerToTime(r.start));
			$('#end_timepicker').val(IntegerToTime(r.end));
			$('#message').val(r.message);
		}
	});                     
}

//hide fake modal slider on cancel
function hideSlider() {
	$('.slider').stop().animate({
		left: '-400px'    
	}, 200);
	$('#overlay').remove();
}

//hide or show list items based on selected datepicker
function hideShowByDate(lookup_date) {
	$('.list-items').each(function() {
		var list_text = $(this).text();
		if (list_text.indexOf(lookup_date) >= 0) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
}

//function for book reservation button
function addDate() {
	//get values and sanitize from form	
	var reservation = {
		id: makeid(),
		date: $("#datepicker").data('datepicker').getFormattedDate('yyyy-mm-dd'),
		start: TimeToInteger($("#start_timepicker").val()),
		end: TimeToInteger($("#end_timepicker").val()),
		message: $('#message').val()
	};
	
	errs = validateReservation(reservation);
	if (errs.length === 0) {
		//insert into array and local storage for data to persist on page loads
		calendar.push(reservation);
		localStorage.setItem('calendar', JSON.stringify(calendar));
		var root = window.location.pathname;
		root = root.substring(0, root.lastIndexOf("/") + 1);
		window.location.href = root + "index.html";
	} else {
		alertErrors(errs);
	}
}

//validate reservation before saving
function validateReservation(reservation) {
	errors = [];
	if (!reservation.date || !reservation.start || !reservation.end) {
		errors.push("All fields must be filled out.");
	}
	if (reservation.start < 0) {
		errors.push("You must properly format Start Time. (ex: 09:30 AM)");
	}
	if (reservation.end < 0) {
		errors.push("You must properly format End Time. (ex: 11:00 PM)");
	}
	if (reservation.start > reservation.end) {
		errors.push("End Time must be greater than Start Time.");
	}
	calendar.forEach(function(r) {
		if ((reservation.date == r.date) && (reservation.id != r.id)) {
			if (reservation.end <= r.start) {
				return true;
			}
			if (reservation.start >= r.end) {
				return true;
			}
			errors.push("Reservation already booked on " + r.date + " from " + IntegerToTime(r.start) + " - " + IntegerToTime(r.end));
		}
	});
	return errors;
}

//save reservation from modal
function save() {
	id = $('#reservation_id').val();
	calendar.forEach(function(r) {
		if (r.id == id) {
			//validate and save reservation here...
			r.start = TimeToInteger($("#start_timepicker").val());
			r.end = TimeToInteger($("#end_timepicker").val());
			r.message = $('#message').val();
			errs = validateReservation(r);
			if (errs.length === 0) {
				localStorage.setItem('calendar', JSON.stringify(calendar));
				location.reload();
			} else {
				alertErrors(errs);
			}
		}
	});
}

//delete reservation from modal
function remove() {
	id = $('#reservation_id').val();
	calendar.forEach(function(r) {
		if (r.id == id) {
			calendar = jQuery.grep(calendar, function(value) {
				return value != r;
			});
			localStorage.setItem('calendar', JSON.stringify(calendar));
		}
	});
	location.reload();
}

// Utility like functions
//creates random ID for list items.
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function alertErrors(errs) {
	//loop and display errors
	msg = "";
	errs.forEach(function(e) {
		msg = msg + e + "\n";
	});
	sweetAlert("Error", msg, "error");
}

//turns time into integer - much easier to compare time differences
function TimeToInteger(input) {
	var regex = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;
	if (regex.test(input)) {
		pieces = input.split(":");
		end_pieces = pieces[1].split(' ');
		ampm = end_pieces[1];
		hour = parseInt(pieces[0]);
		min = parseInt(end_pieces[0]);
		if (ampm == "AM" && hour == 12) {
			hour = 0;
		} else {
			if (ampm == "PM" && hour != 12) {
				hour = hour + 12;
			}
			hour = hour * 60; 
		}
		return hour + min;
	} else {
		return -1;
	}
}

//turns integer back into time for display
function IntegerToTime(input) {
	hour = parseInt(input / 60);
    min = input % 60;
    var ampm = "";
    if (hour >= 12) {
        ampm = "PM";
    } else {
		ampm = "AM";
	}
    if (hour > 12) {
        hour = hour - 12;
    }
    if (hour === 0) {
        hour = 12;
    }
	return ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2) + " " + ampm;
}
// /Utility like functions