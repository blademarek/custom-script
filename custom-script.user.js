// ==UserScript==
// @name         Custom Script
// @version      1.0.0
// @description  Automation script
// @author       Marek Pavol
// @match        *://*.gladiatus.gameforge.com/game/index.php*
// @exclude      *://*.gladiatus.gameforge.com/game/index.php?mod=start
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @resource     customCSS_global https://raw.githubusercontent.com/blademarek/custom-script/main/global.css
// ==/UserScript==

(function() {
    'use strict'

    /*****************
     *  CSS + assets  *
     *****************/

    function addCustomCSS() {
        const globalCSS = GM_getResourceText("customCSS_global")
        GM_addStyle(globalCSS)
    }

    addCustomCSS()

    const assetsUrl = 'https://raw.githubusercontent.com/blademarek/custom-script/master/assets';

    /*****************
     *  Translations  *
     *****************/

    const translations = {
        advanced: 'Advanced',
        afterFightSearch: 'Setting',
        arena: 'Arena',
        boss: 'Boss',
        circusTurma: 'Circus Turma',
        difficulty: 'Difficulty',
        disable: 'Disable',
        dungeon: 'Dungeon',
        enable: 'Enable',
        eventExpedition: 'Event Expedition',
        fightBoss: 'Fight Boss',
        search: 'After fight search',
        expedition: 'Expedition',
        healing: 'Healing',
        healingPercentage: 'Healing under HP %',
        healingBags: 'Healing bags',
        highest: 'Highest',
        in: 'In',
        lastUsed: "Last Used",
        location: 'Location',
        lowest: 'Lowest',
        nextAction: 'Next action',
        normal: 'Normal',
        opponent: 'Opponent',
        opponentLevel: 'Opponent Level',
        quests: 'Quests',
        random: 'Random',
        rubyExpedition: '!!! RUBY EXPEDITION !!!',
        settings: 'Settings',
        smelting: 'Smelting',
        smeltingBags: 'Smelting Bags',
        soon: 'Soon...',
        questType: 'Type',
    }

    const settings = {
        expeditions: {
            enabled: 'false',
            title: translations.expedition,
            subsections: [
                { key: 'opponent', defaultValue: '1' },
                { key: 'location', defaultValue: 'LAST USED' },
            ]
        },
        dungeons: {
            enabled: 'false',
            title: translations.dungeon,
            subsections: [
                { key: 'location', defaultValue: 'LAST USED' },
                { key: 'difficulty', defaultValue: 'Normal' },
                { key: 'fightBoss', defaultValue: 'Yes' },
            ]
        },
        search: {
            enabled: 'false',
            title: translations.search,
            subsections: [
                { key: 'afterFightSearch', defaultValue: 'Thorough' }
            ]
        },
        rubyExpedition: {
            enabled: 'false',
            title: translations.rubyExpedition
        },
        arena: {
            enabled: 'false',
            title: translations.arena,
            subsections: [
                { key: 'opponentLevel', defaultValue: 'Lowest' }
            ]
        },
        circusTurma: {
            enabled: 'false',
            title: translations.circusTurma,
            subsections: [
                { key: 'opponentLevel', defaultValue: 'Lowest' }
            ]
        },
        quests: {
            enabled: 'false',
            title: translations.quests,
            subsections: [
                { key: 'questType', defaultValue: JSON.stringify([]) }
            ]
        },
        eventExpedition: {
            enabled: 'false',
            title: translations.eventExpedition,
            subsections: [
                { key: 'opponent', defaultValue: '1' }
            ]
        },
        healing: {
            enabled: 'false',
            title: translations.healing,
            subsections: [
                { key: 'healingPercentage', defaultValue: '25' },
                { key: 'healingBags', defaultValue: JSON.stringify([]) },
            ]
        },
        smelting: {
            enabled: 'false',
            title: translations.smelting,
            subsections: [
                { key: 'smeltingBags', defaultValue: JSON.stringify([]) },
            ]
        },
    }

    const clickQueue = []
    let isProcessing = false

    function createButton({ id, className, innerHTML, style, onClick }) {
        const button = document.createElement("button")
        if (id) button.setAttribute("id", id)
        if (className) button.className = className
        if (innerHTML) button.innerHTML = innerHTML
        if (style) button.setAttribute("style", style)
        if (onClick) button.addEventListener("click", onClick)
        return button
    }

    const startStopButton = createButton({
        id: "autoGoButton",
        className: "menuitem py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50",
        innerHTML: localStorage.getItem('gladiatusAddon.enabled') === 'true' ? "STOP" : "START",
        onClick: () => {
            const isEnabled = localStorage.getItem('gladiatusAddon.enabled') === 'true'
            const newStatus = !isEnabled
            localStorage.setItem('gladiatusAddon.enabled', newStatus.toString())

            startStopButton.innerHTML = newStatus ? "STOP" : "START"

            if (newStatus) {
                runAddon()
            }
        }
    })

    document
        .getElementById("mainmenu")
        .insertBefore(startStopButton, document.getElementById("mainmenu").children[0])

    const settingsButton = createButton({
        className: "menuitem py-2 px-4 rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50",
        innerHTML: `<img src="${assetsUrl}/cog.svg" title="Settings" height="20" width="20" style="filter: invert(83%) sepia(52%) saturate(503%) hue-rotate(85deg) brightness(103%) contrast(101%);" alt="Settings">`,
        style: "display: flex; justify-content: center; align-items: center; height: 27px; width: 27px; cursor: pointer; border: none; padding: 0; background-image: url('https://i.imgur.com/jf7BXTX.png');",
        onClick: () => {
            openSettings()
        }
    })
    document
        .getElementById("mainmenu")
        .insertBefore(settingsButton, document.getElementById("mainmenu").children[1])

    function openSettings() {
        function closeSettings() {
            document.getElementById('settingsWindow').remove()
            document.getElementById('overlayBack').remove()
        }

        const settingsWindow = document.createElement('div')
        settingsWindow.setAttribute('id', 'settingsWindow')

        const settingsContent = Object.entries(settings).map(([key, value]) => {
            const title = value.title || translations[key]
            const savedValue = value.enabled ? 'enabled' : 'disabled'
            return createSettingsBox(title, key, savedValue, value.subsections)
        }).join('')

        settingsWindow.innerHTML = `
        <div class="settingsHeader">
            <h1>${translations.settings}</h1>
        </div>
        <div class="settingsContent">
            ${settingsContent}
        </div>
        <div class='settingsFooter'></div>
    `

        document.getElementById('header_game').insertBefore(settingsWindow, document.getElementById('header_game').children[0])

        const overlayBack = document.createElement('div')
        const wrapperHeight = document.getElementById('wrapper_game').clientHeight
        overlayBack.setAttribute('id', 'overlayBack')
        overlayBack.setAttribute('style', `height: ${wrapperHeight}px;`)
        overlayBack.addEventListener('click', closeSettings)
        document.body.appendChild(overlayBack)
    }

    function createSettingsBox(title, key, savedValue, subsections = []) {
        const subsectionHTML = generateSubSections(key, subsections)

        return `
            <div class="settings_box">
                <div class="settingsHeaderBig">${title}</div>
                <div class="settingsSubContent">
                    ${['On', 'Off'].map(option => `
                        <div class="settingsButton" data-section="${key}.enabled" data-value="${option}"
                            style="${getOnOffButtonColor(key, option)}">
                            ${option}
                        </div>
                    `).join('')}
                </div>
                ${subsectionHTML}
            </div>
        `
    }

    function formatTime(timeInMs) {
        if (timeInMs < 1000) {
            return '0:00:00'
        }

        let timeInSecs = Math.round(timeInMs / 1000)
        let sec = timeInSecs % 60
        let min = Math.floor((timeInSecs / 60) % 60)
        let hrs = Math.floor(timeInSecs / 3600)

        return `${hrs}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    function showNextActionWindow(actionName, actionTime) {
        const headerGame = document.getElementById('header_game')
        let infoWindow = document.getElementById('infoWindow')

        if (!infoWindow) {
            infoWindow = document.createElement('div')
            infoWindow.id = 'infoWindow'
            infoWindow.style.cssText = `
            display: block;
            position: absolute;
            top: 120px;
            left: 506px;
            height: 72px;
            width: 365px;
            padding-top: 13px;
            color: #58ffbb;
            background-color: rgba(0, 0, 0, 0.86);
            font-size: 20px;
            border-radius: 20px;
            border-left: 10px solid #58ffbb;
            border-right: 10px solid #58ffbb;
            z-index: 999;
        `
            headerGame.prepend(infoWindow)
        }

        infoWindow.innerHTML = `
        <span style="color: #fff;">${translations.nextAction}: </span>
        <span>${actionName}</span><br>
        <span style="color: #fff;">${translations.in}: </span>
        <span>${formatTime(actionTime)}</span>
    `
    }

    function generateSubSections(key, subsections = []) {
        return subsections.map(subsection => {
            const { key: subsectionKey } = subsection
            let contentHTML = ''
            let options = []
            let settingsValue = getSettingValue(key+'.'+subsectionKey)

            switch (subsectionKey) {
                case 'opponent':
                    options = ['1', '2', '3', 'Boss']
                    contentHTML = options.map(option => `
                    <div id="set_${subsectionKey}_${option}" data-section="${key}.${subsectionKey}" data-value="${option}" class="settingsButton"
                        style="${getButtonStyle(key+'.'+subsectionKey, option)}">
                        ${option}
                    </div>
                `).join('')
                    break

                case 'location':
                    const storedValue = getSettingValue(key + '.' + subsectionKey)

                    options = [...new Set([
                        'LAST USED',
                        storedValue,
                        ...Array.from(document.querySelectorAll("#submenu2 a.menuitem"))
                            .slice(1)
                            .map(a => a.textContent.trim())
                    ])]

                    contentHTML = `
                        <div class="w-full">
                            <select class="settingsButton settingsSelect" data-section="${key}.${subsectionKey}">
                                ${options.map(option => `
                                    <option value="${option}" ${option === storedValue ? 'selected' : ''}>${option}</option>
                                `).join('')}
                            </select>
                        </div>
                    `
                    break

                case 'difficulty':
                    options = ['Normal', 'Advanced']
                    contentHTML = options.map(option => `
                    <div id="set_${subsectionKey}_${option}" data-section="${key}.${subsectionKey}" data-value="${option}" class="settingsButton"
                        style="${getButtonStyle(key+'.'+subsectionKey, option)}">
                        ${option}
                    </div>
                `).join('')
                    break

                case 'fightBoss':
                    options = ['Yes', 'No']
                    contentHTML = options.map(option => `
                    <div id="set_${subsectionKey}_${option}" data-section="${key}.${subsectionKey}" data-value="${option}" class="settingsButton"
                        style="${getButtonStyle(key+'.'+subsectionKey, option)}">
                        ${option}
                    </div>
                `).join('')
                    break

                case 'afterFightSearch':
                    options = ['Quick', 'Thorough']
                    contentHTML = options.map(option => `
                    <div id="set_${subsectionKey}_${option}" data-section="${key}.${subsectionKey}" data-value="${option}" class="settingsButton"
                        style="${getButtonStyle(key+'.'+subsectionKey, option)}">
                        ${option}
                    </div>
                `).join('')
                    break

                case 'opponentLevel':
                    options = ['Lowest', 'Highest', 'Random']
                    contentHTML = options.map(option => `
                    <div id="set_${subsectionKey}_${option}" data-section="${key}.${subsectionKey}" data-value="${option}" class="settingsButton"
                        style="${getButtonStyle(key+'.'+subsectionKey, option)}">
                        ${option}
                    </div>
                `).join('')
                    break

                case 'questType':
                    options = ['arena', 'grouparena', 'combat', 'expedition', 'dungeon', 'items']
                    settingsValue = Array.isArray(settingsValue) ? settings : JSON.parse(settingsValue)

                    contentHTML = options.map(option => `
                    <div id="set_${option}_quests_type" data-section="${key}.${subsectionKey}" data-value="${option}" 
                        class="settingsButton quest-type ${option} ${settingsValue.includes(option) ? 'active' : ''}" 
                        style="${settingsValue.includes(option) ? 'border: 2px solid green;' : ''}">
                    </div>
                `).join('')
                    break

                case 'healingPercentage':
                    contentHTML = `
                    <div class="slider-container">
                        <input type="range" id="healingPercentageSlider" min="1" max="100" value="${settingsValue}" class="slider settingsSlider" 
                            data-section="${key}.${subsectionKey}">
                        <span>${settingsValue}%</span>
                    </div>
                    `
                    break

                case 'healingBags':
                case 'smeltingBags':
                    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
                    contentHTML = romanNumerals.map((option, index) => `
                    <div id="set_${option}_healing_bags" data-section="${key}.${subsectionKey}" data-value="${index + 1}" 
                        class="settingsButton"
                        style="${getButtonStyle(key + '.' + subsectionKey, (index + 1).toString())}">
                        ${option}
                    </div>
                `).join('')
                    break

                default:
                    return ''
            }

            return `
            <div class="settingsHeaderSmall">${translations[subsectionKey]}</div>
            <div class="settingsSubContent">
                ${contentHTML}
            </div>
        `
        }).join('')
    }

    function getButtonStyle(settingsKey, optionValue) {
        let settingsValue = getSettingValue(settingsKey)
        let style = ''

        if (settingsKey === 'quests.questType' || settingsKey === 'healing.healingBags' || settingsKey === 'smelting.smeltingBags') {
            settingsValue = Array.isArray(settingsValue) ? settingsValue : JSON.parse(settingsValue)

            style = settingsValue.includes(optionValue) ? 'border: 2px solid green;' : 'filter: brightness(50%)'
        } else if (settingsValue === optionValue) {
            style = 'border: 2px solid green;'
        }

        return style
    }

    function getOnOffButtonColor(sectionKey, option) {
        const storedValue = getSettingValue(`${sectionKey}.enabled`)

        return (option === 'On' && JSON.parse(storedValue)) ? 'border: 2px solid green;' : (option === 'Off' && !JSON.parse(storedValue)) ? 'border: 2px solid red;' : ''
    }

    function getSettingValue(settingString) {
        if (settingString.includes('.enabled')) {
            const storedValue = localStorage.getItem(settingString)
            if (storedValue !== null) {
                return storedValue
            }

            const [sectionKey] = settingString.split('.')
            return settings[sectionKey]?.enabled
        }

        const [sectionKey, subsectionKey] = settingString.split('.')
        const storedValue = localStorage.getItem(settingString)

        if (storedValue !== null) {
            return storedValue
        }

        const subsection = settings[sectionKey]?.subsections.find(sub => sub.key === subsectionKey)
        return subsection ? subsection.defaultValue : null
    }

    function updateButtonsStyle(sectionKey, selectedValue) {
        const buttons = document.querySelectorAll(`[data-section="${sectionKey}"]`)

        buttons.forEach(button => {
            const value = button.getAttribute('data-value')

            if (sectionKey.includes('.enabled')) {
                const color = value === 'On' ? '2px solid green' : '2px solid red'
                button.style.border = value === selectedValue ? color : ''
            } else if (sectionKey === 'quests.questType' || sectionKey === 'healing.healingBags' || sectionKey === 'smelting.smeltingBags') {
                const questTypeSetting = getSettingValue(sectionKey)

                if (questTypeSetting.includes(value)) {
                    button.style.border = '2px solid green'
                    button.style.filter = ''
                    button.classList.add('active')
                } else {
                    button.style.border = ''
                    button.style.filter = 'brightness(50%)'
                    button.classList.remove('active')
                }
            } else if (!sectionKey.includes('location')) {
                button.style.border = value === selectedValue ? '2px solid green' : ''
            }
        })
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)

        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function enqueueClick(selector, elementIndex = 0) {
        return new Promise((resolve) => {
            clickQueue.push({ selector, elementIndex, resolve })
            processQueue()
        })
    }

    async function processQueue() {
        if (isProcessing || clickQueue.length === 0) {
            return
        }

        isProcessing = true

        while (clickQueue.length > 0) {
            const { selector, elementIndex, resolve } = clickQueue.shift()
            const success = await clickElement(selector, elementIndex)

            resolve(success)

            if (success) {
                break
            }
        }

        isProcessing = false
    }

    async function clickElement(selector, elementIndex = 0) {
        return new Promise((resolve) => {
            // const delay = getRandomInt(1000, 5000)
            const delay = getRandomInt(1)
            let elements

            if (selector instanceof Element) {
                elements = [selector]
            } else {
                elements = document.querySelectorAll(selector);
            }

            const elementToClick = elements[elementIndex] || elements[0];

            if (elementToClick) {
                setTimeout(() => {
                    const input = elementToClick.querySelector("input")

                    if (input) {
                        input.click()
                    } else {
                        elementToClick.click()
                    }

                    resolve(true)
                }, delay)
            } else {
                resolve(false)
            }
        })
    }

    async function runAddon() {
        // TODO check other popup windows like the cubes game
        await enqueueClick('#blackoutDialogLoginBonus')
        await enqueueClick('#blackoutDialognotification')
        await afterFightSearch()

        // TODO fix queue
        await checkQuests()
        await checkExpeditions()
        await checkDungeons()
        await checkArena()
        await checkCircusTurma()
    }

    async function afterFightSearch() {
        const enabled = JSON.parse(getSettingValue('search.enabled'))
        const searchSetting = getSettingValue('search.afterFightSearch')

        const position = enabled ? 1 : { 'Quick': 2, 'Thorough': 3 }[searchSetting]

        await enqueueClick(`#blackoutDialog button:nth-of-type(${position})`)
    }

    async function checkQuests() {
        if (!JSON.parse(getSettingValue('quests.enabled'))) {
            return
        }

        if (document.body.id === 'questsPage') {
            await enqueueClick('.quest_slot_button_restart')
            await enqueueClick('.quest_slot_button_finish')

            let questTypes = JSON.parse(getSettingValue('quests.questType'))
            let selector = questTypes.length
                ? questTypes.map(category => `#qcategory_${category} .quest_slot_button_accept`).join(', ')
                : null

            if (selector) {
                let questCooldown = document.querySelectorAll('#quest_header_cooldown')

                if (!questCooldown.length && !(await enqueueClick(selector))) {
                    await enqueueClick('#quest_footer_reroll')
                }

                // TODO store next quest time
            }
        } else {
            await goToPage('pantheon')
        }
    }

    async function checkExpeditions() {
        if (!JSON.parse(getSettingValue('expeditions.enabled'))) {
            return
        }

        // TODO add health check
        // TODO add ruby usage

        const expeditionCooldown = document.querySelector('#cooldown_bar_expedition .cooldown_bar_fill_progress')

        if (expeditionCooldown) {
            return
        }

        const location = getSettingValue('expeditions.location')

        // TODO if player decides to check next location manually and is on that page, there is no way of getting the info on which location he is currently - specifically for 'LAST USED' => will result in current location fight
        if (document.body.id === 'locationPage') {
            await fightExpedition()
        } else {
            if (location === 'LAST USED') {
                await enqueueClick('#cooldown_bar_expedition a.cooldown_bar_link')
            } else {
                const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                    .find(a => a.textContent.trim() === location)

                await enqueueClick(selector)
            }
        }
    }

    async function fightExpedition() {
        const enemy = getSettingValue('expeditions.opponent')

        if (enemy === 'Boss') {
            await enqueueClick(`.expedition_box:nth-of-type(4) .expedition_button`)
        } else {
            await enqueueClick(`.expedition_box:nth-of-type(${enemy}) .expedition_button`)
        }
    }

    async function checkDungeons() {
        if (!JSON.parse(getSettingValue('dungeons.enabled'))) {
            return
        }

        // TODO add health check
        const dungeonCooldown = document.querySelector('#cooldown_bar_dungeon .cooldown_bar_fill_progress')

        if (dungeonCooldown) {
            return
        }

        const location = getSettingValue('dungeons.location')

        if (document.body.id === 'dungeonPage') {
            await fightDungeon()
        } else {
            if (document.body.id === 'locationPage') {
                if (getCurrentTabIndex() === 0) {
                    await enqueueClick('.awesome-tabs', 1)
                }
            } else {
                if (location === 'LAST USED') {
                    await enqueueClick('#cooldown_bar_dungeon a.cooldown_bar_link')
                } else {
                    const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                        .find(a => a.textContent.trim() === location)

                    await enqueueClick(selector)
                }
            }
        }
    }

    async function fightDungeon() {
        const isDifficultySelectWindow = document.querySelector('.dungeon_header_open')

        if (!isDifficultySelectWindow) {
            if (getSettingValue('dungeons.difficulty') === 'Normal') {
                await enqueueClick('[name="dif1"]')
            } else {
                await enqueueClick('[name="dif2"]')
            }
        } else {
            const isBoss = Array.from(document.querySelectorAll('img[onclick]'))
                .some(img => {
                    const nextDiv = img.nextElementSibling
                    return nextDiv && nextDiv.classList.contains('map_label') && !/\d/.test(nextDiv.textContent)
                })

            if (!isBoss || getSettingValue('dungeons.fightBoss') === 'Yes') {
                await enqueueClick('img[onclick]')
            } else {
                await enqueueClick('#content .button1')
            }
        }
    }

    async function checkArena() {
        if (!JSON.parse(getSettingValue('arena.enabled'))) {
            return
        }

        // TODO add health check
        const arenaCooldown = document.querySelector('#cooldown_bar_arena .cooldown_bar_fill_progress')

        if (arenaCooldown) {
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 1) {
                await enqueueClick('.awesome-tabs', 1)
            }

            await fightBySetting(getSettingValue('arena.opponentLevel'), 'own2')
        } else {
            await enqueueClick('#cooldown_bar_arena a.cooldown_bar_link')
        }
    }

    async function checkCircusTurma() {
        if (!JSON.parse(getSettingValue('circusTurma.enabled'))) {
            return
        }

        // TODO add health check
        const circusTurmaCooldown = document.querySelector('#cooldown_bar_ct .cooldown_bar_fill_progress')

        if (circusTurmaCooldown) {
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 3) {
                await enqueueClick('.awesome-tabs', 3)
            }

            await fightBySetting(getSettingValue('circusTurma.opponentLevel'), 'own3')
        } else {
            await enqueueClick('#cooldown_bar_ct a.cooldown_bar_link')
        }
    }

    function fightBySetting(opponentLevelSetting, tableId) {
        const rows = Array.from(document.querySelectorAll(`#${tableId} tbody tr`))
            .map(row => {
                const levelCell = row.querySelector('td:nth-of-type(2)')
                const level = levelCell ? parseInt(levelCell.textContent.trim()) : null

                return { row, level }
            })
            .filter(r => r.level !== null)

        let selectedRows

        if (opponentLevelSetting === 'Lowest') {
            const minLevel = Math.min(...rows.map(r => r.level))
            selectedRows = rows.filter(r => r.level === minLevel)
        } else if (opponentLevelSetting === 'Highest') {
            const maxLevel = Math.max(...rows.map(r => r.level))
            selectedRows = rows.filter(r => r.level === maxLevel)
        } else if (opponentLevelSetting === 'Random') {
            selectedRows = [rows[Math.floor(Math.random() * rows.length)]]
        }

        if (selectedRows.length) {
            const chosenRow = selectedRows[Math.floor(Math.random() * selectedRows.length)]
            chosenRow.row.querySelector('.attack').click()
        }
    }


    function getCurrentTabIndex() {
        return Array.from(document.querySelectorAll('.awesome-tabs')).findIndex(tab => tab.classList.contains('current'))
    }

    async function goToPage(pageName) {
        let menuIndex = null

        switch (pageName) {
            case 'pantheon':
                menuIndex = 1
            break
        }

        if (menuIndex) {
            await enqueueClick(".advanced_menu_link, .advanced_menu_link_active", menuIndex)
        }
    }

    document.addEventListener('click', function (event) {
        if ((event.target.classList.contains('settingsButton') || event.target.classList.contains('settingsSlider')) && !event.target.classList.contains('settingsSelect')) {
            const sectionKey = event.target.getAttribute('data-section')
            const selectedValue = event.target.getAttribute('data-value')

            if (sectionKey.includes('.enabled')) {
                const settingValue = selectedValue === 'On'
                localStorage.setItem(sectionKey, String(settingValue))
                updateButtonsStyle(sectionKey, selectedValue)
            } else if (sectionKey === 'quests.questType' || sectionKey === 'healing.healingBags' || sectionKey === 'smelting.smeltingBags' ) {
                const settingsValue = JSON.parse(getSettingValue(sectionKey))

                if (settingsValue.includes(selectedValue)) {
                    const updatedValues = settingsValue.filter(value => value !== selectedValue)
                    localStorage.setItem(sectionKey, JSON.stringify(updatedValues))
                } else {
                    settingsValue.push(selectedValue)
                    localStorage.setItem(sectionKey, JSON.stringify(settingsValue))
                }

                updateButtonsStyle(sectionKey, selectedValue)
            } else if (sectionKey === 'healing.healingPercentage') {
                const inputElement = event.target
                const newValue = inputElement.value
                localStorage.setItem(sectionKey, newValue)

                const sliderContainer = inputElement.closest('.slider-container')
                const valueSpan = sliderContainer.querySelector('span')

                if (valueSpan) {
                    valueSpan.textContent = newValue + '%'
                }
            } else {
                localStorage.setItem(sectionKey, selectedValue)
                updateButtonsStyle(sectionKey, selectedValue)
            }
        }
    })

    document.addEventListener('change', function (event) {
        if (event.target.classList.contains('settingsSelect')) {
            const sectionKey = event.target.getAttribute('data-section')
            const selectedValue = event.target.value

            localStorage.setItem(sectionKey, selectedValue)
        }
    })

    if (JSON.parse(getSettingValue('gladiatusAddon.enabled'))) {
        window.onload = runAddon
    }
})()
