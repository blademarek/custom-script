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
        arena: 'Arena Provinciarum',
        auctionGoldStorage: 'Auction gold storage',
        boss: 'Boss',
        circusTurma: 'Circus Provinciarum',
        deelay: 'Deelay',
        deelaySeconds: 'Click deelay (seconds)',
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
        healthWarning: 'Healing disabled:',
        healthWarningExecution: 'will not be executed',
        highest: 'Highest',
        in: 'in',
        lastUsed: "Last Used",
        location: 'Location',
        lowest: 'Lowest',
        minGoldValue: 'Store above gold amount',
        minAuctionItemValue: 'Min item value',
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
        smelting: 'smelting',
        eventExpedition: 'eventExpedition'
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
            onOffSection: false,
            title: translations.search,
            subsections: [
                { key: 'afterFightSearch', defaultValue: 'Thorough' }
            ]
        },
        rubyExpedition: {
            onOffSection: false,
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
        auctionGoldStorage: {
            enabled: 'false',
            title: translations.auctionGoldStorage,
            subsections: [
                { key: 'minGoldValue', defaultValue: '1000' },
                { key: 'minAuctionItemValue', defaultValue: '1000' },
            ]
        },
        deelay: {
            onOffSection: false,
            title: translations.deelay,
            subsections: [
                { key: 'deelaySeconds', defaultValue: '1' },
            ]
        },
        smelting: {
            enabled: 'false',
            title: translations.smelting,
            subsections: [
                { key: 'smeltingBags', defaultValue: JSON.stringify([]) },
            ]
        }
    }

    let infoInterval

    const startStopButton = createMenuButton({
        id: 'autoGoButton',
        className: 'menuitem py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50',
        innerHTML: '',
        onClick: () => toggleStartStop(),
        position: 0
    })

    createMenuButton({
        className: 'menuitem py-2 px-4 rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50',
        innerHTML: `<img src="${assetsUrl}/cog.svg" title="Settings" height="20" width="20" style="filter: invert(83%) sepia(52%) saturate(503%) hue-rotate(85deg) brightness(103%) contrast(101%);" alt="Settings">`,
        style: 'display: flex; justify-content: center; align-items: center; height: 27px; width: 27px; cursor: pointer; border: none; padding: 0; background-image: url("https://i.imgur.com/jf7BXTX.png");',
        onClick: () => openSettings(),
        position: 1
    })

    function createButton({ id, className, innerHTML, style, onClick }) {
        const button = document.createElement("button")
        if (id) button.setAttribute("id", id)
        if (className) button.className = className
        if (innerHTML) button.innerHTML = innerHTML
        if (style) button.setAttribute("style", style)
        if (onClick) button.addEventListener("click", onClick)
        return button
    }

    function createMenuButton(props) {
        const mainMenu = document.getElementById('mainmenu')
        const btn = createButton(props)
        mainMenu.insertBefore(btn, mainMenu.children[props.position ?? 0])
        return btn
    }

    async function toggleStartStop() {
        const enabled = !(localStorage.getItem('gladiatusAddon.enabled') === 'true')
        localStorage.setItem('gladiatusAddon.enabled', enabled.toString())
        startStopButton.innerHTML = enabled ? 'STOP' : 'START'

        if (enabled) {
            localStorage.removeItem('actionTimers')
            await runAddon()
        } else {
            toggleInfoWindow(false)
        }
    }

    function renderStartStopButton() {
        startStopButton.innerHTML = localStorage.getItem('gladiatusAddon.enabled') === 'true' ? 'STOP' : 'START'
    }

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
        const closeSettingsListener = async () => {
            await closeSettings()
            document.removeEventListener('keydown', onEscape)
        }

        overlayBack.setAttribute('id', 'overlayBack')
        overlayBack.setAttribute('style', `height: ${wrapperHeight}px;`)
        overlayBack.addEventListener('click', closeSettingsListener)
        document.body.appendChild(overlayBack)

        const onEscape = async (e) => {
            if (e.key === 'Escape') await closeSettingsListener()
        }

        document.addEventListener('keydown', onEscape)
    }

    async function closeSettings() {
        document.getElementById('settingsWindow').remove()
        document.getElementById('overlayBack').remove()

        if (JSON.parse(getSettingValue('gladiatusAddon.enabled'))) {
            await runAddon()
        }

        toggleInfoWindow(true)
    }

    function createSettingsBox(title, key, savedValue, subsections = []) {
        const subsectionHTML = generateSubSections(key, subsections)
        const onOffSectionHTML = settings[key]?.onOffSection === false ? ``: `
            <div class="settingsSubContent">
                ${['On', 'Off'].map(option => `
                    <div class="settingsButton" data-section="${key}.enabled" data-value="${option}"
                        style="${getOnOffButtonColor(key, option)}">
                        ${option}
                    </div>
                `).join('')}
            </div>`

        return `
            <div class="settings_box">
                <div class="settingsHeaderBig">${title}</div>
                ${onOffSectionHTML}
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

        if (nextAction) {
            localStorage.setItem('nextActionTime', nextAction.time.getTime())
            worker.postMessage(nextAction.time.getTime())
            setTimeout(showInfoWindow, getRandomDeelay(), nextAction)
        } else {
            localStorage.setItem('gladiatusAddon.enabled', 'false')
            renderStartStopButton()
            showInfoWindow()
        }
    }

    function showInfoWindow(nextAction) {
        const headerGame = document.getElementById('header_game')
        let infoWindow = document.getElementById('infoWindow')

        if (!infoWindow) {
            infoWindow = document.createElement('div')
            infoWindow.id = 'infoWindow'

            headerGame.prepend(infoWindow)
        }

        if (infoInterval) {
            clearInterval(infoInterval)
            infoInterval = null
        }

        if (nextAction) {
            infoWindow.innerHTML = getInfoWindowContent(nextAction)

            infoInterval = setInterval(() => {
                infoWindow.innerHTML = getInfoWindowContent(nextAction)
            }, 1000)
        } else {
            infoWindow.innerHTML = getInfoWindowContent()
        }

        toggleInfoWindow(true)
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

        if (!healingPossible() && isLowHp()) {
            const enabledSettings = []

            if (JSON.parse(getSettingValue('expedition.enabled'))) {
                enabledSettings.push(translations.expedition)
            }

            if (JSON.parse(getSettingValue('arena.enabled'))) {
                enabledSettings.push(translations.arena)
            }

            if (enabledSettings.length) {
                content =
                    `
                    <span style="white-space: nowrap;color: red;">${translations.healthWarning} <span style="color: #58ffbb;">${enabledSettings.join(', ')}</span> ${translations.healthWarningExecution}</span><br>
                `
            }
        }

        if (nextAction) {
            content +=
                `
                <div style="margin-top:5px">
                    <span style="color: #fff;">${translations.nextAction}: </span>
                    <span>${translations[nextAction.type]}</span>
                    <span style="color: #fff;">${translations.in}: </span>
                    <span>${formatNextActionTime(nextAction.time)}</span>
                </div>
            `
        } else {
            content +=
                `
                <div style="margin-top:5px">
                    <span style="color: #fff;">${translations.noAction}</span>
                </div>
            `
        }

        return content
    }

    function getNextActionData() {
        const currentActions = JSON.parse(getSettingValue('actionTimers')) || {}

        return Object.entries(currentActions)
            .map(([type, time]) => {
                const actionStatus = JSON.parse(getSettingValue(`${type}.enabled`))
                if (actionStatus === false || ([actionTypes.arena, actionTypes.circusTurma, actionTypes.expedition].includes(type) && !healingPossible() && isLowHp())) {
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

                case 'deelaySeconds':
                    contentHTML = `
                    <div class="slider-container">
                        <input type="range" id="${subsectionKey}Slider" min="1" max="10" value="${settingsValue}" class="slider settingsSlider"
                            data-section="${key}.${subsectionKey}">
                        <span>${settingsValue}</span>
                    </div>
                    `
                    break

                case 'minGoldValue':
                case 'minAuctionItemValue':
                    contentHTML = `
                    <div class="slider-container">
                        <input type="range" id="${subsectionKey}Slider" min="1000" max="100000" value="${settingsValue}" class="slider settingsSlider"
                            data-section="${key}.${subsectionKey}">
                        <span>${settingsValue}</span>
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

    function getRandomDeelay() {
        const deelaySecondsSetting = parseFloat(getSettingValue('deelay.deelaySeconds'))
        const min = Math.ceil(deelaySecondsSetting * 1000)
        const max = Math.floor((deelaySecondsSetting + 1) * 1000)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    async function clickElement(selector, delay) {
        const finalDelay = delay !== undefined ? delay : getRandomDeelay()
        await new Promise(r => setTimeout(r, finalDelay))

        let elements
        if (selector instanceof Element) {
            elements = [selector]
        } else {
            elements = document.querySelectorAll(selector)
        }

        const elementToClick = elements[0]
        if (!elementToClick) {
            return false
        }

        const input = elementToClick.querySelector('input')

        if (input) {
            input.click()
        } else {
            elementToClick.click()
        }

        await new Promise(r => setTimeout(r, finalDelay))

        return true
    }

    async function runAddon() {
        if (JSON.parse(getSettingValue('gladiatusAddon.enabled'))) {
            localStorage.removeItem('nextActionTime')

            // TODO check other popup windows like the cubes game
            await clickElement('#blackoutDialogLoginBonus', 0)
            await clickElement('#blackoutDialognotification', 0)
            await afterFightSearch()

            await checkQuests()
            await checkExpeditions()
            await checkDungeons()
            await checkArena()
            await checkCircusTurma()
            await checkSmelting()
            await checkAuctionStore()
            queueNextAction()
        }
    }

    async function afterFightSearch() {
        const searchSetting = getSettingValue('search.afterFightSearch')
        const position = { 'Quick': 2, 'Thorough': 3 }[searchSetting]

        await clickElement(`#blackoutDialog button:nth-of-type(${position})`, 0)
    }

    async function checkQuests() {
        if (!JSON.parse(getSettingValue('quest.enabled')) || isOnCooldown(actionTypes.quest)) {
            return
        }

        if (document.body.id === 'questsPage') {
            const restartButton = document.querySelector('.quest_slot_button_restart')

            if (restartButton) {
                await clickElement(restartButton)
            }

            const finishButton = document.querySelector('.quest_slot_button_finish')

            if (finishButton) {
                await clickElement(finishButton)
            }

            let questTypes = JSON.parse(getSettingValue('quest.questType'))
            let selector = questTypes.length
                ? questTypes.map(category => `#qcategory_${category} .quest_slot_button_accept`).join(', ')
                : null

            if (selector) {
                await clickElement(selector)
            }

            let questCooldown = document.querySelectorAll('#quest_header_cooldown')

            if (!questCooldown.length) {
                await clickElement('#quest_footer_reroll input[type="button"]')
            }

            saveNextActionTime(actionTypes.quest, calculateTaskFinishedTime(document.querySelector('#quest_header_cooldown span').textContent.trim()))
        } else {
            await goToPage('pantheon')
        }
    }

    async function checkExpeditions() {
        const fightWithRubies = parseInt(getSettingValue('rubyExpedition.rubyUsage')) > 0
        const fightWithoutRubies = JSON.parse(getSettingValue('expedition.enabled'))
        const cooldownCheck = document.querySelector('#cooldown_bar_expedition .cooldown_bar_fill_progress')
        const nextActionTime = document.querySelector('#cooldown_bar_expedition').textContent.trim()

        if ((!fightWithRubies && (!fightWithoutRubies || isOnCooldown(actionTypes.expedition, cooldownCheck, nextActionTime))) || !await checkHealing()) {
            return
        }

        const location = getSettingValue('expedition.location')

        // TODO if player decides to check next location manually and is on that page, there is no way of getting the info on which location he is currently - specifically for 'LAST USED' => will result in current location fight
        if (document.body.id === 'locationPage') {
            await fightExpedition(cooldownCheck)
        } else {
            if (location === 'LAST USED') {
                await clickElement('#cooldown_bar_expedition a.cooldown_bar_link')
            }

            const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                .find(a => a.textContent.trim() === location)

            if (selector) {
                await clickElement(selector)
            } else {
                localStorage.setItem('expedition.enabled', 'false')
            }
        }
    }

    async function fightExpedition(expeditionCooldown) {
        const enemy = getSettingValue('expedition.opponent')

        if (expeditionCooldown) {
            const rubiesToUseCount = parseInt(getSettingValue('rubyExpedition.rubyUsage'))
            localStorage.setItem('rubyExpedition.rubyUsage', Math.max(0, (rubiesToUseCount - 1)).toString())
        }

        if (enemy === 'Boss') {
            await clickElement(`.expedition_box:nth-of-type(4) .expedition_button`)
        } else {
            await clickElement(`.expedition_box:nth-of-type(${enemy}) .expedition_button`)
        }
    }

    // TODO - integrate the functionality of the event expedition - only available during special occasions, think about the eventTimers reset on midnight
    async function checkEventExpedition() {
        if ((!JSON.parse(getSettingValue('eventExpedition.enabled')) || getNextActionTypeTime(actionTypes.eventExpedition) > new Date())) {
            return
        }

        if (!await checkHealing()) {
            return
        }

        const eventLive = document.querySelector('#banner_event')

        if (!eventLive) {
            return
        }

        const eventExpeditionCooldown = [...eventLive.querySelectorAll('span')].find(span => span.textContent.trim().startsWith('-'))

        if (eventExpeditionCooldown) {
            saveNextActionTime(actionTypes.eventExpedition, calculateTaskFinishedTime('0:' + eventExpeditionCooldown.textContent.trim().replace(/^-\s*/, '')))
            return
        }

        await fightEventExpedition()
    }

    async function fightEventExpedition() {
        const eventLocation = document.querySelector('#banner_event_link')

        if (eventLocation && window.location.href !== eventLocation.href) {
            await clickElement(eventLocation)
        }

        const ticker = document.querySelector('span.ticker')
        const timeMatch = ticker?.textContent.match(/\d{1,2}:\d{2}:\d{2}$/)
        const timeValue = timeMatch ? timeMatch[0] : null

        if (timeValue) {
            saveNextActionTime(actionTypes.eventExpedition, calculateTaskFinishedTime(timeValue))
        } else {
            const enemy = getSettingValue('eventExpedition.opponent')

            if (enemy === 'Boss') {
                await clickElement(`.expedition_box:nth-of-type(4) .expedition_button`)
            } else {
                await clickElement(`.expedition_box:nth-of-type(${enemy}) .expedition_button`)
            }
        }
    }

    async function checkDungeons() {
        const cooldownCheck = document.querySelector('#cooldown_bar_dungeon .cooldown_bar_fill_progress')
        const nextActionTime = document.querySelector('#cooldown_bar_dungeon').textContent.trim()

        if (!JSON.parse(getSettingValue('dungeon.enabled')) || isOnCooldown(actionTypes.dungeon, cooldownCheck, nextActionTime)) {
            return
        }

        const location = getSettingValue('dungeon.location')

        if (document.body.id === 'dungeonPage') {
            await fightDungeon()
        } else {
            if (document.body.id === 'locationPage') {
                if (getCurrentTabIndex() === 0) {
                    await clickElement('.awesome-tabs:first-of-type')
                }
            } else {
                if (location === 'LAST USED') {
                    await clickElement('#cooldown_bar_dungeon a.cooldown_bar_link')
                } else {
                    const selector = Array.from(document.querySelectorAll('#submenu2 a.menuitem'))
                        .find(a => a.textContent.trim() === location)

                    if (selector) {
                        await clickElement(selector)
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
                await clickElement('[name="dif1"]')
            } else {
                await clickElement('[name="dif2"]')
            }
        } else {
            const isBoss = Array.from(document.querySelectorAll('img[onclick]'))
                .some(img => {
                    const nextDiv = img.nextElementSibling
                    return nextDiv && nextDiv.classList.contains('map_label') && !/\d/.test(nextDiv.textContent)
                })

            if (!isBoss || getSettingValue('dungeon.fightBoss') === 'Yes') {
                await clickElement(document.querySelector('img[onclick]'))
            } else {
                await clickElement('#content .button1')
            }
        }
    }

    async function checkArena() {
        const cooldownCheck = document.querySelector('#cooldown_bar_arena .cooldown_bar_fill_progress')
        const nextActionTime = document.querySelector('#cooldown_bar_arena').textContent.trim()

        if (!JSON.parse(getSettingValue('arena.enabled')) || isOnCooldown(actionTypes.arena, cooldownCheck, nextActionTime) || !await checkHealing()) {
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 1) {
                await clickElement('.awesome-tabs:first-of-type')
            }

            await fightBySetting(getSettingValue('arena.opponentLevel'), 'own2')
        } else {
            await clickElement('#cooldown_bar_arena a.cooldown_bar_link')
        }
    }

    function isOnCooldown(actionType, cooldownCheck, nextActionTime) {
        if (getNextActionTypeTime(actionType) > new Date()) {
            return true
        }

        if (cooldownCheck && nextActionTime) {
            saveNextActionTime(actionType, calculateTaskFinishedTime(nextActionTime))
            return true
        }

        return false
    }

    async function checkCircusTurma() {
        const cooldownCheck = document.querySelector('#cooldown_bar_ct .cooldown_bar_fill_progress')
        const nextActionTime = document.querySelector('#cooldown_bar_ct').textContent.trim()

        if (!JSON.parse(getSettingValue('circusTurma.enabled')) || isOnCooldown(actionTypes.circusTurma, cooldownCheck, nextActionTime)) {
            return
        }

        if (document.body.id === 'arenaPage') {
            if (getCurrentTabIndex() !== 3) {
                await clickElement('.awesome-tabs:nth-of-type(4)')
            }

            await fightBySetting(getSettingValue('circusTurma.opponentLevel'), 'own3')
        } else {
            await clickElement('#cooldown_bar_ct a.cooldown_bar_link')
        }
    }

    async function fightBySetting(opponentLevelSetting, tableId) {
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
            await clickElement(chosenRow.row.querySelector('.attack'))
        }
    }

    async function checkHealing() {
        if (!isLowHp()) {
            return true
        }

        if (!healingPossible()) {
            return false
        }

        if (document.body.id !== 'overviewPage') {
            await goToPage('overview')
        } else {
            if (getCurrentTabIndex() !== 0) {
                await clickElement('.awesome-tabs:nth-of-type(1)')
            }
        }

        await checkFoodInBags()
        return true
    }

    async function checkFoodInBags() {
        const healingBags = JSON.parse(getSettingValue('healing.healingBags'))
        const inventoryTabs = Array.from(document.querySelectorAll('.inventoryBox .awesome-tabs'))
        let food = null

        for (const tabIndex of healingBags) {
            await clickElement(inventoryTabs[parseInt(tabIndex) - 1])

            while (isLowHp()) {
                food = await calculateBestFood()

                if (food) {
                    await healUp(food)
                } else {
                    break
                }
            }

            if (!isLowHp()) {
                return
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

    async function healUp(foodToUse) {
        const targetElement = document.querySelector('.ui-droppable')

        if (targetElement) {
            await simulateDrag(foodToUse.element, targetElement, targetElement.getBoundingClientRect().left + targetElement.offsetWidth / 2, targetElement.getBoundingClientRect().top + targetElement.offsetHeight / 2)
        }
    }

    async function checkSmelting() {
        const smeltingDisabled = !JSON.parse(getSettingValue('smelting.enabled')) || !JSON.parse(getSettingValue('smelting.smeltingBags')).length
        if (smeltingDisabled || isOnCooldown(actionTypes.smelting)) {
            return
        }

        if (document.body.id !== 'forgePage') {
            await clickElement(Array.from(document.querySelectorAll('#submenu1 a.menuitem')).find(a => a.href.includes('smeltery')))
        }

        await smeltItems()
    }

    async function smeltItems() {
        const smeltTabs = Array.from(document.querySelectorAll('#forge_nav div'))
        let forgeFinishTimes = []

        for (const smeltTabIndex of smeltTabs.keys()) {
            await clickElement(smeltTabs[smeltTabIndex], 1000)

            if (smeltTabs[smeltTabIndex].classList.contains('forge_crafting')) {
                const taskFinishedTime = calculateTaskFinishedTime(document.querySelector('#forge_time_remaining').textContent.trim())
                forgeFinishTimes.push(taskFinishedTime)

                continue
            }

            if (smeltTabs[smeltTabIndex].classList.contains('forge_finished-succeeded')) {
                await clickElement('#forge_horreum', 0)
            }

            const smelted = await smeltItem()

            if (!smelted) {
                localStorage.setItem('smelting.enabled', 'false')
                return
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
            await clickElement(inventoryTabs[parseInt(tabIndex) - 1])

            const smeltItems = Array.from(document.querySelectorAll('#inv div'))
                .filter(div => ['1', '2', '4', '8', '48', '256', '512', '1024'].includes(div.getAttribute('data-content-type')))

            if (smeltItems.length) {
                await simulateDrag(smeltItems[0], smeltPlace, smeltPlace.getBoundingClientRect().left + smeltPlace.offsetWidth / 2, smeltPlace.getBoundingClientRect().top + smeltPlace.offsetHeight / 2)
                await clickElement(document.querySelector('#rent .awesome-button[data-rent="2"]'), 0)
                return true
            }
        }

        return false
    }

    async function checkAuctionStore() {
        if (!JSON.parse(getSettingValue('auctionGoldStorage.enabled'))) {
            return
        }

        const currentGold = parseInt(document.querySelector('#sstat_gold_val').textContent.replace('.', ''), 10)

        if (currentGold < JSON.parse(getSettingValue('auctionGoldStorage.minGoldValue'))) {
            return
        }

        if (document.body.id === 'auctionPage') {
            await checkAuctionFilter()
            await buyAuctionItems(currentGold)
        } else {
            await clickElement(Array.from(document.querySelectorAll('#submenu1 a.menuitem')).find(a => a.href.includes('auction')))
        }
    }

    async function checkAuctionFilter() {
        const form = document.forms.filterForm
        let changed = false

        if (form.qry.value.trim() !== '') {
            form.qry.value = ''
            changed = true
        }

        if (form.itemLevel.selectedIndex !== 0) {
            form.itemLevel.selectedIndex = 0
            changed = true
        }

        if (form.itemType.selectedIndex !== 0) {
            form.itemType.selectedIndex = 0
            changed = true
        }

        if (form.itemQuality.selectedIndex !== 0) {
            form.itemQuality.selectedIndex = 0
            changed = true
        }

        if (!changed) {
            return
        }

        await clickElement(form.querySelector('input[type="submit"]'))
    }

    async function buyAuctionItems(currentGold) {
        const minItemValue = JSON.parse(getSettingValue('auctionGoldStorage.minAuctionItemValue'))

        while (true) {
            const items = await findSuitableAuctionItems(currentGold, minItemValue)

            if (!items.length) {
                break
            }

            let boughtAny = false

            for (const { container, value } of items) {
                if (value > currentGold) {
                    continue
                }

                const button = container.querySelector('input[name="bid"]')

                if (button) {
                    await clickElement(button)
                    currentGold -= value
                    boughtAny = true
                }
            }

            const affordableItems = items.some(item => item.value <= currentGold)

            if (!boughtAny || !affordableItems) {
                break
            }
        }
    }

    async function findSuitableAuctionItems(currentGold, minItemValue) {
        return Array.from(document.querySelectorAll('input[name="bid_amount"][style*="rgb(255, 204, 102)"]'))
            .map(input => {
                const value = parseInt(input.value, 10)

                if (value < minItemValue || value > currentGold) {
                    return null
                }

                const container = input.closest('.auction_bid_div')

                return { container, value }
            })
            .filter(Boolean)
            .sort((a, b) => b.value - a.value)
    }

    function isLowHp() {
        const percentageSetting = parseInt(getSettingValue('healing.healingPercentage'), 10)
        const percentage = parseInt(document.querySelector('#header_values_hp_percent').textContent.trim(), 10)

        return percentage < percentageSetting
    }

    function healingPossible() {
        return JSON.parse(getSettingValue('healing.enabled')) && JSON.parse(getSettingValue('healing.healingBags')).length
    }

    async function simulateDrag(item, targetElement, x, y) {
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
        await new Promise(r => setTimeout(r, 500))

        targetElement.dispatchEvent(mouseMoveEvent)
        await new Promise(r => setTimeout(r, 500))

        targetElement.dispatchEvent(mouseUpEvent)
        await new Promise(r => setTimeout(r, 500))
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
            await clickElement(document.querySelectorAll('.advanced_menu_link, .advanced_menu_link_active')[menuIndex])
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
            } else if (['healing.healingPercentage', 'deelay.deelaySeconds', 'auctionGoldStorage.minGoldValue', 'auctionGoldStorage.minAuctionItemValue'].includes(sectionKey)) {
                const inputElement = event.target
                const newValue = inputElement.value
                localStorage.setItem(sectionKey, newValue)

                const sliderContainer = inputElement.closest('.slider-container')
                const valueSpan = sliderContainer.querySelector('span')

                if (valueSpan) {
                    valueSpan.textContent = newValue + (sectionKey === 'healing.healingPercentage' ? '%' : '')
                }
            } else if (sectionKey !== 'rubyExpedition.rubyUsage'){
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

    const workerCode = `
        self.onmessage = function(e) {
            let targetTime = e.data

            function checkTime() {
                const remainingTime = targetTime - Date.now()
                if (remainingTime <= 0) {
                    postMessage("runAddon")
                } else {
                    setTimeout(checkTime, Math.min(remainingTime, 10 * 1000)) // Check every 10s if far away
                }
            }

            checkTime()
        }
    `

    const worker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })))

    worker.onmessage = async (event) => {
        if (event.data === "runAddon") {
            await runAddon()
        }
    }

    window.onload = async () => {
        renderStartStopButton()
        await runAddon()

        const storedTime = localStorage.getItem('nextActionTime')
        if (storedTime) {
            worker.postMessage(parseInt(storedTime, 10))
        }
    }
})()
