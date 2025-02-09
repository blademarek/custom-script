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
        healingPercentage: 'Stop/Heal under HP %',
        healingBags: 'Healing bags',
        healthWarning: 'Healing disabled - fight actions will not be executed',
        highest: 'Highest',
        in: 'In',
        lastUsed: "Last Used",
        location: 'Location',
        lowest: 'Lowest',
        nextAction: 'Next action',
        normal: 'Normal',
        noAction: 'No Action queued',
        opponent: 'Opponent',
        opponentLevel: 'Opponent Level',
        quest: 'Quest',
        random: 'Random',
        rubyExpedition: '!!! RUBY EXPEDITION !!!',
        rubyUsage: 'Use number of rubies',
        settings: 'Settings',
        smelting: 'Smelting',
        smeltingBags: 'Smelting Bags',
        soon: 'Soon...',
        questType: 'Type',
    }

    const actionTypes = {
        quest: 'quest',
        expedition: 'expedition',
        dungeon: 'dungeon',
        arena: 'arena',
        circusTurma: 'circusTurma',
        smelting: 'smelting'
    }

    const settings = {
        expedition: {
            enabled: 'false',
            title: translations.expedition,
            subsections: [
                { key: 'opponent', defaultValue: '1' },
                { key: 'location', defaultValue: 'LAST USED' },
            ]
        },
        dungeon: {
            enabled: 'false',
            title: translations.dungeon,
            subsections: [
                { key: 'location', defaultValue: 'LAST USED' },
                { key: 'difficulty', defaultValue: 'Normal' },
                { key: 'fightBoss', defaultValue: 'Yes' },
            ]
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
        search: {
            enabled: 'false',
            title: translations.search,
            subsections: [
                { key: 'afterFightSearch', defaultValue: 'Thorough' }
            ]
        },
        rubyExpedition: {
            enabled: 'false',
            title: translations.rubyExpedition,
            subsections: [
                { key: 'rubyUsage', defaultValue: '0' }
            ]
        },
        quest: {
            enabled: 'false',
            title: translations.quest,
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
            const addonStatus = !(localStorage.getItem('gladiatusAddon.enabled') === 'true')
            localStorage.setItem('gladiatusAddon.enabled', addonStatus.toString())

            startStopButton.innerHTML = addonStatus ? "STOP" : "START"

            if (addonStatus) {
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
        toggleInfoWindow(false)

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

    function closeSettings() {
        document.getElementById('settingsWindow').remove()
        document.getElementById('overlayBack').remove()

        if (JSON.parse(getSettingValue('gladiatusAddon.enabled'))) {
            runAddon()
        }

        toggleInfoWindow(true)
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

    function formatNextActionTime(nextActionTime) {
        const timeInMs = nextActionTime - new Date()

        if (timeInMs < 1000) {
            return '0:00:00'
        }

        let timeInSecs = Math.round(timeInMs / 1000)
        let sec = timeInSecs % 60
        let min = Math.floor((timeInSecs / 60) % 60)
        let hrs = Math.floor(timeInSecs / 3600)

        return `${hrs}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    function queueNextAction() {
        const nextAction = getNextActionData()

        setTimeout(runAddon, nextAction.time - new Date())
        showInfoWindow(nextAction)
    }

    function showInfoWindow(nextAction) {
        const headerGame = document.getElementById('header_game')
        let infoWindow = document.getElementById('infoWindow')

        if (!infoWindow) {
            infoWindow = document.createElement('div')
            infoWindow.id = 'infoWindow'

            headerGame.prepend(infoWindow)

            if (nextAction) {
                infoWindow.innerHTML = getInfoWindowContent(nextAction)

                setInterval(function() {
                    infoWindow.innerHTML = getInfoWindowContent(nextAction)
                }, 1000);
            } else {
                toggleInfoWindow(false)
            }
        }
    }

    function toggleInfoWindow(show) {
        const infoWindow = document.getElementById('infoWindow')

        if (!infoWindow) {
            return
        }

        if (show) {
            infoWindow.style.display = 'block'
        } else {
            infoWindow.style.display = 'none'
        }
    }

    function getInfoWindowContent(nextAction) {
        let content = ''

        if (!canHeal() && isLowHp()) {
            content =
                `
                    <span style="white-space: nowrap;color: red;">${translations.healthWarning}</span><br>
                `
        }

        content +=
            `
                <div style="margin-top:5px">
                    <span style="color: #fff;">${translations.nextAction}: </span>
                    <span>${translations[nextAction.type]}</span>
                    <span style="color: #fff;">${translations.in}: </span>
                    <span>${formatNextActionTime(nextAction.time)}</span>
                </div>
            `
        return content
    }

    function getNextActionData() {
        const currentActions = JSON.parse(getSettingValue('actionTimers')) || {}

        return Object.entries(currentActions)
            .map(([type, time]) => {
                const actionStatus = JSON.parse(getSettingValue(`${type}.enabled`))
                if (actionStatus === false || ([actionTypes.arena, actionTypes.circusTurma, actionTypes.expedition].includes(type) && !canHeal() && isLowHp())) {
                    return null
                }

                return { type, time: new Date(time) }
            })
            .filter(action => action !== null)
            .filter(({ time }) => time > new Date())
            .reduce((closest, action) =>
                !closest || action.time < closest.time ? action : closest, null)
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

                case 'rubyUsage':
                    const value = parseInt(getSettingValue('rubyExpedition.rubyUsage'))

                    contentHTML = `
                    <input type="number" id="set_${subsectionKey}" data-section="${key}.${subsectionKey}" class="settingsInput settingsButton" 
                        value="${value}" min="0">
                    `
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
                        style="${settingsValue.includes(option) ? 'border: 2px solid green;' : 'filter: brightness(50%)'}">
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

        if (settingsKey === 'quest.questType' || settingsKey === 'healing.healingBags' || settingsKey === 'smelting.smeltingBags') {
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
            } else if (sectionKey === 'quest.questType' || sectionKey === 'healing.healingBags' || sectionKey === 'smelting.smeltingBags') {
                const questTypeSetting = JSON.parse(getSettingValue(sectionKey))

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

    function enqueueClick(selector, delay) {
        return new Promise((resolve) => {
            clickQueue.push({ selector, resolve, delay })
            processQueue()
        })
    }

    async function processQueue() {
        if (isProcessing || clickQueue.length === 0) {
            return
        }

        isProcessing = true

        while (clickQueue.length > 0) {
            const { selector, resolve, delay } = clickQueue.shift()
            const success = await clickElement(selector, delay)

            resolve(success)

            if (success) {
                break
            }
        }

        isProcessing = false
    }

    async function clickElement(selector, delay) {
        return new Promise((resolve) => {
            const delay = getRandomInt(1000, 2000)
            // delay = delay !== undefined ? delay : 0
            let elements

            if (selector instanceof Element) {
                elements = [selector]
            } else {
                elements = document.querySelectorAll(selector)
            }

            const elementToClick = elements[0]

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
        await enqueueClick('#blackoutDialogLoginBonus', 0)
        await enqueueClick('#blackoutDialognotification', 0)
        await afterFightSearch()

        await checkQuests()
        await checkExpeditions()
        await checkDungeons()
        await checkArena()
        await checkCircusTurma()
        await checkSmelting()
        queueNextAction()
    }

    async function afterFightSearch() {
        const enabled = JSON.parse(getSettingValue('search.enabled'))
        const searchSetting = getSettingValue('search.afterFightSearch')

        const position = enabled ? 1 : { 'Quick': 2, 'Thorough': 3 }[searchSetting]

        await enqueueClick(`#blackoutDialog button:nth-of-type(${position})`, 0)
    }

    async function checkQuests() {
        if (!JSON.parse(getSettingValue('quest.enabled')) || getNextActionTypeTime(actionTypes.quest) > new Date()) {
            return
        }

        if (document.body.id === 'questsPage') {
            await enqueueClick(document.querySelector('.quest_slot_button_restart'))
            await enqueueClick(document.querySelector('.quest_slot_button_finish'))

            let questTypes = JSON.parse(getSettingValue('quest.questType'))
            let selector = questTypes.length
                ? questTypes.map(category => `#qcategory_${category} .quest_slot_button_accept`).join(', ')
                : null

            if (selector) {
                await enqueueClick(selector)
            }

            let questCooldown = document.querySelectorAll('#quest_header_cooldown')

            if (!questCooldown.length && !(await enqueueClick(selector))) {
                await enqueueClick('#quest_footer_reroll input[type="button"]')
            }

            const nextQuestTime = calculateTaskFinishedTime(document.querySelector('#quest_header_cooldown span').textContent.trim())
            saveNextActionTime(actionTypes.quest, nextQuestTime)
        } else {
            await goToPage('pantheon')
        }
    }

    async function checkExpeditions() {
        const useRubies = JSON.parse(getSettingValue('rubyExpedition.enabled'))
        const rubiesToUseCount = parseInt(getSettingValue('rubyExpedition.rubyUsage'))
        const fightWithRubies = useRubies && rubiesToUseCount > 0

        if ((!JSON.parse(getSettingValue('expedition.enabled')) || getNextActionTypeTime(actionTypes.expedition) > new Date()) && !fightWithRubies || !await checkHealing()) {
            return
        }

        const expeditionCooldown = document.querySelector('#cooldown_bar_expedition .cooldown_bar_fill_progress')

        if (expeditionCooldown && !fightWithRubies) {
            saveNextActionTime(actionTypes.expedition, calculateTaskFinishedTime(document.querySelector('#cooldown_bar_expedition').textContent.trim()))
            return
        }

        const location = getSettingValue('expedition.location')

        // TODO if player decides to check next location manually and is on that page, there is no way of getting the info on which location he is currently - specifically for 'LAST USED' => will result in current location fight
        if (document.body.id === 'locationPage') {
            await fightExpedition(expeditionCooldown)
        } else {
            if (location === 'LAST USED') {
                await enqueueClick('#cooldown_bar_expedition a.cooldown_bar_link')
            } else {
                const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                    .find(a => a.textContent.trim() === location)

                if (selector) {
                    await enqueueClick(selector)
                } else {
                    localStorage.setItem('expedition.enabled', 'false')
                    localStorage.setItem('expedition.location', 'LAST USED')
                }
            }
        }
    }

    async function fightExpedition(expeditionCooldown) {
        const enemy = getSettingValue('expedition.opponent')

        if (expeditionCooldown) {
            const rubiesToUseCount = parseInt(getSettingValue('rubyExpedition.rubyUsage'))
            localStorage.setItem('rubyExpedition.rubyUsage', (rubiesToUseCount - 1).toString())
        }

        if (enemy === 'Boss') {
            await enqueueClick(`.expedition_box:nth-of-type(4) .expedition_button`)
        } else {
            await enqueueClick(`.expedition_box:nth-of-type(${enemy}) .expedition_button`)
        }
    }

    async function checkDungeons() {
        if (!JSON.parse(getSettingValue('dungeon.enabled')) || getNextActionTypeTime(actionTypes.dungeon) > new Date()) {
            return
        }

        const dungeonCooldown = document.querySelector('#cooldown_bar_dungeon .cooldown_bar_fill_progress')

        if (dungeonCooldown) {
            saveNextActionTime(actionTypes.dungeon, calculateTaskFinishedTime(document.querySelector('#cooldown_bar_dungeon').textContent.trim()))
            return
        }

        const location = getSettingValue('dungeon.location')

        if (document.body.id === 'dungeonPage') {
            await fightDungeon()
        } else {
            if (document.body.id === 'locationPage') {
                if (getCurrentTabIndex() === 0) {
                    await enqueueClick('.awesome-tabs:first-of-type')
                }
            } else {
                if (location === 'LAST USED') {
                    await enqueueClick('#cooldown_bar_dungeon a.cooldown_bar_link')
                } else {
                    const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                        .find(a => a.textContent.trim() === location)

                    if (selector) {
                        await enqueueClick(selector)
                    } else {
                        localStorage.setItem('dungeon.enabled', 'false')
                        localStorage.setItem('dungeon.location', 'LAST USED')
                    }
                }
            }
        }
    }

    async function fightDungeon() {
        const isDifficultySelectWindow = document.querySelector('.dungeon_header_open')

        if (!isDifficultySelectWindow) {
            if (getSettingValue('dungeon.difficulty') === 'Normal') {
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

            if (!isBoss || getSettingValue('dungeon.fightBoss') === 'Yes') {
                await enqueueClick(document.querySelector('img[onclick]'))
            } else {
                await enqueueClick('#content .button1')
            }
        }
    }

    async function checkArena() {
        if (!JSON.parse(getSettingValue('arena.enabled')) || getNextActionTypeTime(actionTypes.arena) > new Date() || !await checkHealing()) {
            return
        }

        const arenaCooldown = document.querySelector('#cooldown_bar_arena .cooldown_bar_fill_progress')

        if (arenaCooldown) {
            saveNextActionTime(actionTypes.arena, calculateTaskFinishedTime(document.querySelector('#cooldown_bar_arena').textContent.trim()))
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 1) {
                await enqueueClick('.awesome-tabs:first-of-type')
            }

            await fightBySetting(getSettingValue('arena.opponentLevel'), 'own2')
        } else {
            await enqueueClick('#cooldown_bar_arena a.cooldown_bar_link')
        }
    }

    async function checkCircusTurma() {
        if (!JSON.parse(getSettingValue('circusTurma.enabled')) || getNextActionTypeTime(actionTypes.circusTurma) > new Date() || !await checkHealing()) {
            return
        }

        const circusTurmaCooldown = document.querySelector('#cooldown_bar_ct .cooldown_bar_fill_progress')

        if (circusTurmaCooldown) {
            saveNextActionTime(actionTypes.circusTurma, calculateTaskFinishedTime(document.querySelector('#cooldown_bar_ct').textContent.trim()))
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 3) {
                await enqueueClick('.awesome-tabs:nth-of-type(4)')
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

    async function checkHealing() {
        if (!canHeal() && isLowHp()) {
            return false
        }

        if (document.body.id !== 'overviewPage') {
            await goToPage('overview')
        } else {
            if (getCurrentTabIndex() !== 0) {
                await enqueueClick('.awesome-tabs:nth-of-type(1)')
            }
        }

        await checkFoodInBags()
    }

    async function checkFoodInBags() {
        const healingBags = JSON.parse(getSettingValue('healing.healingBags'))
        const inventoryTabs = Array.from(document.querySelectorAll('.inventoryBox .awesome-tabs'))
        let food = null

        for (const tabIndex of healingBags) {
            await enqueueClick(inventoryTabs[parseInt(tabIndex) - 1])

            while (isLowHp()) {
                food = await calculateBestFood()

                if (food) {
                    await healUp(food)
                } else {
                    break
                }
            }
        }

        if (!food) {
            localStorage.setItem('healing.enabled', 'false')
        }
    }

    async function calculateBestFood() {
        const food = Array.from(document.querySelectorAll('#inv div[data-vitality]'))
            .map(div => ({
                vitality: parseInt(div.getAttribute('data-vitality'), 10),
                element: div
            }))
            .filter(item => !isNaN(item.vitality))

        if (!food.length) {
            return false
        } else {
            const hpBarElement = document.querySelector('#header_values_hp_bar')
            const currentHealth = hpBarElement ? parseInt(hpBarElement.getAttribute('data-value'), 10) : 0
            const maxHealth = hpBarElement ? parseInt(hpBarElement.getAttribute('data-max-value'), 10) : 0
            const overshotLimit = maxHealth - currentHealth
            const allowedOvershot = overshotLimit * 0.1

            const validFoods = food.filter(item => item.vitality <= overshotLimit + allowedOvershot)

            let bestFood = validFoods.reduce((closest, item) => {
                const diff = Math.abs(item.vitality - (overshotLimit + allowedOvershot))
                const closestDiff = Math.abs(closest.vitality - (overshotLimit + allowedOvershot))

                if (diff < closestDiff || closest.vitality === 0) {
                    return item
                }
                return closest
            }, { vitality: 0 })

            if (!bestFood.vitality) {
                bestFood = food.reduce((smallest, item) => {
                    return smallest.vitality === 0 || item.vitality < smallest.vitality ? item : smallest
                }, { vitality: 0 })
            }

            return bestFood
        }
    }

    async function healUp(foodToUser) {
        const targetElement = document.querySelector('.ui-droppable')

        if (targetElement) {
            simulateDrag(foodToUser.element, targetElement, targetElement.getBoundingClientRect().left + targetElement.offsetWidth / 2, targetElement.getBoundingClientRect().top + targetElement.offsetHeight / 2)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    async function checkSmelting() {
        if (!JSON.parse(getSettingValue('smelting.enabled')) || !JSON.parse(getSettingValue('smelting.smeltingBags')).length || getNextActionTypeTime(actionTypes.smelting) > new Date()) {
            return
        }

        const nextForgeFinished = localStorage.getItem('nextForgeFinished')

        if (nextForgeFinished && new Date(nextForgeFinished) > new Date()) {
            return
        }

        if (document.body.id === 'forgePage') {
            await smeltItems()
        } else {
            await enqueueClick(Array.from(document.querySelectorAll('#submenu1 a.menuitem')).find(a => a.href.includes('smeltery')))
        }
    }

    async function smeltItems() {
        const smeltTabs = Array.from(document.querySelectorAll('#forge_nav div'))
        let smeltItemsFound = true
        let forgeFinishTimes = []

        for (const smeltTabIndex of smeltTabs.keys()) {
            await enqueueClick(smeltTabs[smeltTabIndex])

            if (smeltTabs[smeltTabIndex].classList.contains('forge_crafting')) {
                await new Promise(resolve => setTimeout(resolve, 2000))
                const taskFinishedTime = calculateTaskFinishedTime(document.querySelector('#forge_time_remaining').textContent.trim())
                forgeFinishTimes.push(taskFinishedTime)

                continue
            }

            if (smeltTabs[smeltTabIndex].classList.contains('forge_finished-succeeded')) {
                await enqueueClick('#forge_horreum')
            }

            if (smeltItemsFound) {
                smeltItemsFound = await smeltItem()
            } else {
                localStorage.setItem('smelting.enabled', 'false')
            }
        }

        const closestFinishTime = forgeFinishTimes.reduce((closest, currentTime) => {
            const currentDiff = Math.abs(currentTime - new Date())
            const closestDiff = Math.abs(closest - new Date())
            return currentDiff < closestDiff ? currentTime : closest
        }, forgeFinishTimes[0])

        saveNextActionTime(actionTypes.smelting, closestFinishTime)
    }

    async function smeltItem() {
        const smeltPlace = document.querySelector('#forge_box #itembox')
        const smeltBags = JSON.parse(getSettingValue('smelting.smeltingBags'))
        const inventoryTabs = Array.from(document.querySelectorAll('.inventoryBox .awesome-tabs'))

        for (const tabIndex of smeltBags) {
            await enqueueClick(inventoryTabs[parseInt(tabIndex) - 1])

            const smeltItems = Array.from(document.querySelectorAll('#inv div'))
                .filter(div => ['1', '2', '4', '8', '48', '256', '512', '1024'].includes(div.getAttribute('data-content-type')))

            if (smeltItems.length) {
                simulateDrag(smeltItems[0], smeltPlace, smeltPlace.getBoundingClientRect().left + smeltPlace.offsetWidth / 2, smeltPlace.getBoundingClientRect().top + smeltPlace.offsetHeight / 2)
                await new Promise(resolve => setTimeout(resolve, 1000))
                await enqueueClick(document.querySelector('#rent .awesome-button[data-rent="2"]'))
                return true
            }
        }

        return false
    }

    function isLowHp() {
        const percentageSetting = parseInt(getSettingValue('healing.healingPercentage'), 10)
        const percentage = parseInt(document.querySelector('#header_values_hp_percent').textContent.trim(), 10)

        return percentage < percentageSetting
    }

    function canHeal() {
        return JSON.parse(getSettingValue('healing.enabled')) && JSON.parse(getSettingValue('healing.healingBags')).length
    }

    function simulateDrag(item, targetElement, x, y) {
        const cords_item = item.getBoundingClientRect()
        const cords_target = { x: x, y: y }

        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: cords_item.left + window.scrollX,
            clientY: cords_item.top + window.scrollY,
            bubbles: true,
            cancelable: true
        })

        const mouseMoveEvent = new MouseEvent('mousemove', {
            clientX: cords_target.x + window.scrollX,
            clientY: cords_target.y + window.scrollY,
            bubbles: true,
            cancelable: true
        })

        const mouseUpEvent = new MouseEvent('mouseup', {
            clientX: cords_target.x + window.scrollX,
            clientY: cords_target.y + window.scrollY,
            bubbles: true,
            cancelable: true
        })

        item.dispatchEvent(mouseDownEvent)
        targetElement.dispatchEvent(mouseMoveEvent)
        targetElement.dispatchEvent(mouseUpEvent)
    }

    function calculateTaskFinishedTime(timeRemaining) {
        const [hours, minutes, seconds] = timeRemaining.split(':').map(Number)

        const totalTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds
        const taskFinishedTime = new Date()
        taskFinishedTime.setSeconds(taskFinishedTime.getSeconds() + totalTimeInSeconds)

        return taskFinishedTime
    }

    function saveNextActionTime(eventType, date) {
        const currentActions = JSON.parse(getSettingValue('actionTimers')) || {}
        currentActions[eventType] = date
        localStorage.setItem('actionTimers', JSON.stringify(currentActions))
    }

    function getNextActionTypeTime(eventType) {
        const currentActions = JSON.parse(getSettingValue('actionTimers')) || {}
        return currentActions[eventType] ? new Date(currentActions[eventType]) : new Date()
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
            case 'overview':
                menuIndex = 0
            break
        }

        if (menuIndex !== null) {
            await enqueueClick(document.querySelectorAll('.advanced_menu_link, .advanced_menu_link_active')[menuIndex])
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
            } else if (sectionKey === 'quest.questType' || sectionKey === 'healing.healingBags' || sectionKey === 'smelting.smeltingBags' ) {
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

    document.addEventListener('input', event => {
        if (event.target.classList.contains(`settingsButton`)) {
            let newValue = event.target.value

            if (event.target.classList.contains('settingsSelect')) {
                const sectionKey = event.target.getAttribute('data-section')

                localStorage.setItem(sectionKey, newValue)
            } else {
                newValue = parseInt(newValue) || 0
                if (newValue < 0) {
                    newValue = 0
                }

                event.target.value = newValue
                localStorage.setItem(event.target.getAttribute('data-section'), newValue.toString())
            }
        }
    })

    document.addEventListener('change', function (event) {
        if (event.target.classList.contains('settingsInput')) {
            const sectionKey = event.target.getAttribute('data-section')
            const selectedValue = event.target.value

            localStorage.setItem(sectionKey, selectedValue)
        }
    })

    if (JSON.parse(getSettingValue('gladiatusAddon.enabled'))) {
        window.onload = runAddon
    }
})()
