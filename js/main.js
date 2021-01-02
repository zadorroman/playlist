'use strict';

const SONG_LIST = [
	{
		author: "LED ZEPPELIN",
		song: "STAIRWAY TO HEAVEN"
	},
	{
		author: "QUEEN",
		song: "BOHEMIAN RHAPSODY"
	},
	{
		author: "LYNYRD SKYNYRD",
		song: "FREE BIRD"
	},
	{
		author: "DEEP PURPLE",
		song: "SMOKE ON THE WATER"
	},
	{
		author: "JIMI HENDRIX",
		song: "ALL ALONG THE WATCHTOWER"
	},
	{
		author: "AC/DC",
		song: "BACK IN BLACK"
	},
	{
		author: "QUEEN",
		song: "WE WILL ROCK YOU"
	},
	{
		author: "METALLICA",
		song: "ENTER SANDMAN"
	}
];

let FORM = document.forms['updateForm'];
let audioInProgress = false;
let CURRENT_AUDIO;
let count;

(function () {
	// Add New Song
	let addBtn = document.querySelector('.add');
	addBtn.addEventListener('click', () => {
		editSong();
	});

	// Close Window
	let closeBtn = document.querySelector('.close');
	closeBtn.addEventListener('click', toggleWindow);

	//Save Info
	let saveBtn = document.querySelector('.save');
	saveBtn.addEventListener('click', saveSong);

	drawList();


})();

function drawList() {
	let container = document.querySelector('.playlist__list'),
		PARSED_LIST = JSON.parse(localStorage.getItem('songList'));

	container.innerHTML = '';

	if (PARSED_LIST === null || !PARSED_LIST.length) {
		SONG_LIST.forEach((item, i) => {
			item.id = i;
		});

		localStorage.setItem('songList', JSON.stringify(SONG_LIST));
		PARSED_LIST = SONG_LIST;
	}

	PARSED_LIST.forEach((item) => {
		container.append(renderItem(item.song, item.author, item.id));
		count = item.id;
	});
}

function renderItem(title, author, id) {
	let item = document.createElement('li'),
		num = document.createElement('div'),
		box = document.createElement('div'),
		songElem = document.createElement('div'),
		authorElem = document.createElement('div'),
		timeElem = document.createElement('div'),
		spanT = document.createElement('span'),
		btns = document.querySelector('.btns').cloneNode(true);

	item.className = 'playlist__item';
	num.className = 'playlist__num';
	box.className = 'playlist__box';
	songElem.className = 'playlist__song';
	authorElem.className = 'playlist__author';
	timeElem.className = 'playlist__time';


	songElem.innerText = title;
	authorElem.innerText = author.toLowerCase();
	num.innerHTML = `${id + 1}.`;

	box.append(authorElem, songElem);
	timeElem.append(btns, spanT);
	item.append(num, box, timeElem);

	//кнопки
	let
		editBtn = btns.querySelector('.edit'),
		deleteBtn = btns.querySelector('.delete');

	let song = {
		author: author,
		song: title,
		id: id
	}

	//события при клике
	editBtn.addEventListener('click', () => {
		editSong(song);
	});

	deleteBtn.addEventListener('click', () => {
		deleteSong(song);
	});

	item.addEventListener('dblclick', function () {
		let title = document.querySelector('.playlist__author--head'),
			songEl = document.querySelector('.playlist__song--head'),
			img = document.querySelector('.playlist__pic'),
			back = document.querySelector('.playlist__wrap'),
			url = song.author.toLowerCase().split(' ').join('-');



		title.innerHTML = song.author;
		songEl.innerHTML = song.song;
		if (song.author != 'AC/DC') {
			img.src = `images/${url}.jpg`;
			back.style.backgroundImage = `url('images/${url}.jpg')`;
		} else {
			img.src = 'images/acdc.jpg';
			back.style.backgroundImage = "url('images/acdc.jpg')";
		}

		playSong(song, spanT, this);

	});

	item.addEventListener('click', function () {
		stopSong(this);
	});

	return item;
}

function toggleWindow() {
	let window = document.querySelector('.modal');

	if (window.classList.contains('show')) {
		window.classList.remove('show');

		FORM.title.value = '';
		FORM.author.value = '';
		FORM.dataset.id = '';
	} else {
		window.classList.add('show');
	}
}

function editSong(item) {
	if (item) {
		FORM.title.value = item.song;
		FORM.author.value = item.author;
		FORM.dataset.id = item.id;
	}
	toggleWindow();
}

function saveSong() {
	if (FORM.title.value === '' || FORM.author.value === '') {
		alert('Please fill all fields');
		return;
	}

	let calculatedId = setId();

	let item = {
		song: FORM.title.value,
		author: FORM.author.value,
		id: calculatedId
	},
		listStored = JSON.parse(localStorage.getItem('songList')),
		i = listStored.findIndex(elem => elem.id === item.id);

	if (i !== -1) {
		listStored[i].song = item.song;
		listStored[i].author = item.author;
		listStored[i].id = item.id;
	} else {
		listStored.push(item);
	}

	localStorage.setItem('songList', JSON.stringify(listStored));
	drawList();

	toggleWindow();
}

function setId() {
	let listStored = JSON.parse(localStorage.getItem('songList')),
		num = parseInt(listStored.length),
		idList = [];

	if (FORM.dataset.id) {
		return parseInt(FORM.dataset.id);
	} else {
		listStored.forEach(item => {
			idList.push(item.id);
		});

		return idList.includes(num) ? setId() : num;
	}
}

// Delete Song
function deleteSong(item) {
	let listStored = JSON.parse(localStorage.getItem('songList')),
		userAnswer = confirm(`Are you sure you want to delete ${item.song}?`);

	if (userAnswer) {
		if (listStored.length) {
			let i = listStored.findIndex(elem => elem.author === item.author && elem.song === item.song);

			listStored.splice(i, 1);
		}

		localStorage.setItem('songList', JSON.stringify(listStored));

		drawList();
	}
}

// Play Song 
function playSong(item, spanT) {
	if (!audioInProgress) {
		let url = item.song.toLowerCase().split(' ').join('-');

		CURRENT_AUDIO = new Audio(`media/${url}.mp3`);
		CURRENT_AUDIO.load();
		CURRENT_AUDIO.volume = .3;
		CURRENT_AUDIO.play();


		CURRENT_AUDIO.ontimeupdate = function () {
			let
				minutes = Math.floor((CURRENT_AUDIO.duration - CURRENT_AUDIO.currentTime) / 60),
				seconds = Math.floor((CURRENT_AUDIO.duration - CURRENT_AUDIO.currentTime) - (minutes * 60));

			if (seconds <= 9) {
				spanT.innerText = `${minutes}: 0${seconds} `;
			} else {
				spanT.innerText = `${minutes}: ${seconds} `;
			}


		}


		audioInProgress = true;

	}
}


// Stop Song
function stopSong() {
	CURRENT_AUDIO.pause()
	audioInProgress = false;


}


	// (function ($) {
	// 	$(document).ready(function () {
	// 		// Code

	// 	});
	// })(jQuery);
