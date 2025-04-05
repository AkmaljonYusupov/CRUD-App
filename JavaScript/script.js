$(document).ready(function () {
	let taskList = []
	let currentEditIndex = null
	let currentFilter = 'all'
	let currentSearch = ''

	// Enter tugmasi bilan qo‘shish
	$('#taskInput').on('keydown', function (e) {
		if (e.key === 'Enter') {
			$('#addTaskBtn').click()
		}
	})

	// Toast ko‘rsatish
	function showToast(message, type = 'info') {
		const toastId = `toast-${Date.now()}`
		const toast = $(`\
          <div class="toast align-items-center text-bg-${type} border-0" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">\
            <div class="d-flex">\
              <div class="toast-body">${message}</div>\
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>\
            </div>\
          </div>\
        `)
		$('#toastContainer').append(toast)
		const bsToast = new bootstrap.Toast(document.getElementById(toastId))
		bsToast.show()
		toast.on('hidden.bs.toast', () => toast.remove())
	}

	// Sana formatlash
	function formatTime(isoString) {
		const date = new Date(isoString)
		return date.toLocaleString('uz-UZ')
	}

	// Saqlash
	function saveTasks() {
		localStorage.setItem('taskList', JSON.stringify(taskList))
	}

	// Yuklash
	function loadTasks() {
		const saved = localStorage.getItem('taskList')
		if (saved) taskList = JSON.parse(saved)
	}

	// Statistikani yangilash
	function updateStatistics() {
		const totalTasks = taskList.length
		const likedTasks = taskList.filter(t => t.liked).length
		const completedTasks = taskList.filter(t => t.completed).length
		const uncompletedTasks = totalTasks - completedTasks

		$('#totalTasks').text(totalTasks)
		$('#likedTasks').text(likedTasks)
		$('#completedTasks').text(completedTasks)
		$('#uncompletedTasks').text(uncompletedTasks)
	}

	// Render qilish
	function renderTasks() {
		$('#taskList').empty()
		let filteredTasks = taskList

		// Filter bo'yicha tanlash
		if (currentFilter === 'liked') {
			filteredTasks = taskList.filter(t => t.liked)
		} else if (currentFilter === 'unliked') {
			filteredTasks = taskList.filter(t => !t.liked)
		} else if (currentFilter === 'completed') {
			filteredTasks = taskList.filter(t => t.completed)
		} else if (currentFilter === 'uncompleted') {
			filteredTasks = taskList.filter(t => !t.completed)
		}

		// Qidiruvga moslash
		if (currentSearch) {
			filteredTasks = filteredTasks.filter(t =>
				t.name.toLowerCase().includes(currentSearch.toLowerCase())
			)
		}

		if (filteredTasks.length === 0) {
			$('#taskList').append(`<div class="text-muted">Ma'lumot topilmadi.</div>`)
		}

		filteredTasks.forEach((task, index) => {
			$('#taskList').append(`\
            <div class="card ${
							task.completed ? 'completed' : ''
						}" data-index="${index}">\
              <div class="card-body">\
                <div id="task-item" class="d-flex justify-content-between align-items-center">\
                  <div>\    
                    <h3 class="card-title m-0">${task.name}</h3>\
                    <div class="task-time">📅 Qo‘shilgan: ${formatTime(
											task.createdAt
										)}</div>\
                  </div>\
                  <div>\    
                    <button class="btn btn-sm btn-success like-btn m-1" data-index="${index}">\
                      <i class="fas ${
												task.liked ? 'fa-thumbs-up' : 'fa-thumbs-down'
											}"></i>\
                    </button>\
                    <button class="btn btn-sm btn-warning edit-btn m-1" data-index="${index}">\
                      <i class="fas fa-edit"></i>\
                    </button>\
                    <button class="btn btn-sm btn-danger delete-btn m-1" data-index="${index}">\
                      <i class="fas fa-trash-alt"></i>\
                    </button>\
                    <button class="btn btn-sm btn-info complete-btn m-1 ${
											task.completed ? 'completed-active' : ''
										}" data-index="${index}">\
                      <i class="fas ${
												task.completed ? 'fa-check' : 'fa-times'
											}"></i> <span>${
				task.completed ? 'Bajarildi' : 'Bajarilmagan'
			}</span> 
                    </button>\
                  </div>\
                </div>\
              </div>\
            </div>\
          `)
		})

		// Statistikani yangilash
		updateStatistics()
	}

	// Qo‘shish
	$('#addTaskBtn').click(function () {
		const taskName = $('#taskInput').val().trim()
		if (taskName) {
			taskList.push({
				name: taskName,
				liked: false,
				completed: false,
				createdAt: new Date().toISOString(),
			})
			$('#taskInput').val('')
			saveTasks()
			renderTasks()
			showToast('Vazifa qo‘shildi', 'success')
		} else {
			showToast('Bo‘sh vazifa qo‘shilmadi', 'warning')
		}
	})

	// Like
	$(document).on('click', '.like-btn', function () {
		const index = $(this).data('index')
		taskList[index].liked = !taskList[index].liked
		saveTasks()
		renderTasks()
		showToast(
			taskList[index].liked ? 'Like bosildi 👍' : 'Like olib tashlandi 👎',
			'info'
		)
	})

	// Bajarilgan task
	$(document).on('click', '.complete-btn', function () {
		const index = $(this).data('index')
		taskList[index].completed = !taskList[index].completed
		saveTasks()
		renderTasks()
		showToast(
			taskList[index].completed
				? 'Vazifa bajarildi ✔'
				: 'Vazifa bajarilmagan ❌',
			'info'
		)
	})

	// O‘chirish
	$(document).on('click', '.delete-btn', function () {
		const index = $(this).data('index')
		taskList.splice(index, 1)
		saveTasks()
		renderTasks()
		showToast('Vazifa o‘chirildi', 'danger')
	})

	// Edit modal ochish
	$(document).on('click', '.edit-btn', function () {
		currentEditIndex = $(this).data('index')
		$('#editInput').val(taskList[currentEditIndex].name)
		new bootstrap.Modal('#editModal').show()
	})

	// Edit saqlash
	$('#saveEditBtn').click(function () {
		const newName = $('#editInput').val().trim()
		if (newName && currentEditIndex !== null) {
			taskList[currentEditIndex].name = newName
			saveTasks()
			renderTasks()
			showToast('Vazifa tahrirlandi', 'primary')
			bootstrap.Modal.getInstance(document.getElementById('editModal')).hide()
		}
	})

	// Filter tanlash
	$('#filterSelect').change(function () {
		currentFilter = $(this).val()
		renderTasks()
	})

	// Qidirish
	$('#searchInput').on('input', function () {
		currentSearch = $(this).val().trim()
		renderTasks()
	})

	// Ilovani yuklash
	loadTasks()
	renderTasks()
})
