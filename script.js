document.addEventListener("DOMContentLoaded", function () {
    // Поиск, фильтр и сортировка на странице «Мои курсы».
    const search = document.getElementById("search");
    const filter = document.getElementById("course-filter");
    const sort = document.getElementById("sort");
    const grid = document.getElementById("course-grid");
    const emptyMessage = document.getElementById("empty-message");

    function updateCourses() {
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll(".moodle-course-card"));
        const searchText = search ? search.value.trim().toLowerCase() : "";
        const filterValue = filter ? filter.value : "all";
        let visibleCount = 0;

        cards.forEach(function (card) {
            const name = card.dataset.name.toLowerCase();
            const status = card.dataset.status;
            const matchesText = name.includes(searchText);
            const matchesFilter = filterValue === "all" || status === filterValue;
            card.hidden = !(matchesText && matchesFilter);
            if (!card.hidden) visibleCount++;
        });

        if (sort) {
            const visibleCards = cards.filter(function (card) { return !card.hidden; });
            if (sort.value === "asc" || sort.value === "desc") {
                visibleCards.sort(function (a, b) {
                    const comparison = a.dataset.name.localeCompare(b.dataset.name, "ru");
                    return sort.value === "asc" ? comparison : -comparison;
                });
                visibleCards.forEach(function (card) { grid.appendChild(card); });
            }
        }
        if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    }

    if (search) search.addEventListener("input", updateCourses);
    if (filter) filter.addEventListener("change", updateCourses);
    if (sort) sort.addEventListener("change", updateCourses);
    updateCourses();

    // Подставляем правильное название курса из адреса course.html?course=...
    const courseTitle = document.getElementById("course-title");
    const courseNames = {
        interfaces: "Интерфейсы",
        ux: "UX-психология",
        prototype: "Прототипирование интерфейсов",
        digital: "Человек в цифровой среде",
        testing: "Тестирование программного обеспечения",
        ai: "Искусственный интеллект"
    };

    if (courseTitle) {
        const parameters = new URLSearchParams(window.location.search);
        const courseCode = parameters.get("course");
        if (courseNames[courseCode]) {
            courseTitle.textContent = courseNames[courseCode];
            document.title = courseNames[courseCode];
        }
    }

    // Демонстрационное содержимое файлов: оно используется и для предпросмотра, и для скачивания.
    const materials = {
        lecture: {
            title: "Лекция. Введение в тему",
            filename: "lecture.txt",
            text: "Лекция. Введение в тему\n\nЦель занятия — познакомиться с основными понятиями и принципами проектирования интерфейсов.\n\nОсновные вопросы:\n1. Что такое пользовательский интерфейс.\n2. Как интерфейс помогает пользователю выполнять задачи.\n3. Почему важны ясность, последовательность и обратная связь.\n\nЭто демонстрационный материал прототипа."
        },
        checklist: {
            title: "Пример чек-листа",
            filename: "checklist.txt",
            text: "Чек-лист проверки формы входа\n\n[ ] Поле логина отображается.\n[ ] Поле пароля отображается.\n[ ] Пустые поля проверяются.\n[ ] При неверных данных появляется понятное сообщение.\n[ ] Пользователь может показать или скрыть пароль.\n[ ] Элементы доступны с клавиатуры."
        },
        lab: {
            title: "Задание к лабораторной работе",
            filename: "lab_assignment.txt",
            text: "Задание к лабораторной работе\n\n1. Выберите интерфейс цифрового сервиса.\n2. Определите основную пользовательскую задачу.\n3. Найдите не менее трёх проблем интерфейса.\n4. Предложите изменения, которые помогут пользователю.\n5. Создайте статический прототип и опишите его функции.\n\nРезультат: прототип и краткое описание решений."
        },
        practice: {
            title: "Инструкция к практической работе",
            filename: "practice_instruction.txt",
            text: "Инструкция к практической работе\n\nШаг 1. Откройте страницу курса.\nШаг 2. Найдите нужный учебный материал.\nШаг 3. Нажмите «Предпросмотр», чтобы прочитать его без скачивания.\nШаг 4. Нажмите «Скачать», чтобы сохранить текстовый демонстрационный файл.\n\nПримечание: материалы являются примерами, созданными специально для прототипа."
        }
    };

    const modal = document.getElementById("preview-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");

    function closeModal() {
        if (modal) modal.hidden = true;
    }

    document.querySelectorAll("[data-preview]").forEach(function (button) {
        button.addEventListener("click", function () {
            const material = materials[button.dataset.preview];
            if (!material || !modal) return;

            modalTitle.textContent = material.title;
            modalContent.textContent = material.text;
            modalContent.style.whiteSpace = "pre-line";
            modal.hidden = false;
        });
    });

    document.querySelectorAll("[data-download]").forEach(function (button) {
        button.addEventListener("click", function () {
            const material = materials[button.dataset.download];
            if (!material) return;

            const file = new Blob([material.text], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = material.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        });
    });

    const closeTop = document.getElementById("close-modal");
    const closeBottom = document.getElementById("close-modal-bottom");
    if (closeTop) closeTop.addEventListener("click", closeModal);
    if (closeBottom) closeBottom.addEventListener("click", closeModal);

    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal();
        });
    }
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeModal();
    });

    // Переключение вкладок внутри курса.
    const tabs = document.querySelectorAll(".course-tab");
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (item) { item.classList.remove("active"); });
            tab.classList.add("active");

            document.querySelectorAll(".tab-panel").forEach(function (panel) {
                panel.hidden = panel.id !== tab.dataset.tab;
            });
        });
    });
});
