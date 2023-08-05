var config = localStorage.getItem('config')

if (!config) {
    localStorage.setItem('config', 'auto')
    config = 'auto'
}

const warning = document.querySelector('.warning')
const wordsContainer = document.querySelector('.wordsContainer')
const wordsDiv = document.querySelector('#words')
const minutesP = document.querySelector('.minutes')
const secondsP = document.querySelector('.seconds')
const input = document.querySelector('.input')
const score = document.querySelector('#score')
const loading = document.querySelector('.loading')
const toggleContainer = document.querySelector('.toggleContainer')
const toggleBox = document.querySelector('.toggleBox')
const toggle = document.querySelector('.toggle')
var words = []
var currentWordInterval
var seconds = 60
var timerStarted = false
var lastInput = ''
var wordCount = 0
var correctlySpelledWords = 0
var characters = 0
var correctChars = 0
var incorrectChars = 0

function getWords() {
    try {
        axios.get('https://random-word-api.herokuapp.com/word?number=1000&length=5')
            .then((response) => {
                words = response.data
                let id = 0

                words.forEach(w => {
                    let word = document.createElement('p')
                    word.textContent = w
                    word.id = id
                    word.className = 'word'
                    wordsDiv.className = 'words'
                    wordsDiv.appendChild(word)
                    id++
                })

                input.disabled = false
                input.focus()
                wordsContainer.removeChild(loading)
                warning.style.visibility = 'visible'

                currentWordInterval = setInterval(() => {
                    let currentWord = document.getElementById(wordCount)
                    currentWord.style.color = 'blue'

                    if (seconds < 1) {
                        clearInterval(currentWordInterval)
                    }
                }, 100)
            })
            .catch (() => {
                let errorMessage = document.createElement('p')
                errorMessage.textContent = 'Failed to load words. Check your internet connection and/or refresh the page.'
                errorMessage.className = 'errorMessage'
                wordsContainer.appendChild(errorMessage)
                wordsContainer.removeChild(loading)
            })
    } catch {
        let errorMessage = document.createElement('p')
        errorMessage.textContent = 'Failed to load words. Check your internet connection and/or refresh the page.'
        errorMessage.className = 'errorMessage'
        wordsContainer.appendChild(errorMessage)
        wordsContainer.removeChild(loading)
    } 
}

function timer() {
    if (timerStarted || input.value.trim().length === 0) {
        return
    }

    timerStarted = true

    warning.style.visibility = 'hidden'
    toggleContainer.style.visibility = 'hidden'

    let interval = setInterval(() => {
        seconds--

        if (seconds < 1) {
            clearInterval(interval)
            input.disabled = true
            input.style.color = 'gray'
            input.style.cursor = 'not-allowed'
            input.value = input.value.trim()

            if (config === 'spacebar' && input.value === words[0]) {
                correctlySpelledWords++
                document.getElementById(wordCount).style.color = 'rgba(0, 0, 0, 0.3)'
                clearInterval(currentWordInterval)
                wordCount++
            }

            for (let i = 0; i < input.value.length; i++) {
                if (input.value[i] === words[0][i]) {
                    correctChars++
                }
            }

            input.value = 'Time\'s up!'
            
            let wordsPerMinute = document.createElement('p')
            let charsPerMinute = document.createElement('p')
            let wordsAccuracy = document.createElement('p')
            let charsAccuracy = document.createElement('p')
            
            wordsPerMinute.textContent = 'Your word score: ' + correctlySpelledWords + ' per minute'
            charsPerMinute.textContent = 'Your character score: ' + correctChars + ' per minute'
            wordsAccuracy.textContent = 'Your word accuracy: ' + ~~((correctlySpelledWords / wordCount) * 100) + '%'
            charsAccuracy.textContent = 'Your character accuracy: ' + ~~((correctChars / (correctChars + incorrectChars)) * 100) + '%'
            
            score.className = 'score'
            score.appendChild(wordsPerMinute)
            score.appendChild(charsPerMinute)
            score.appendChild(wordsAccuracy)
            score.append(charsAccuracy)
        }
        
        minutesP.textContent = '0' + ~~(seconds / 60)
        secondsP.textContent = seconds < 10 ? '0' + (seconds - minutesP.textContent * 60) : seconds - minutesP.textContent * 60
    }, 1000)
}

function checkWord () {
    if (seconds < 1)
        return

    input.value = input.value.trimStart()
    let currentWord = document.getElementById(wordCount)
    let nextWord = document.getElementById(wordCount + 1)

    switch (config) {
        case 'auto': {
            if (input.value.trim() === words[0]) {
                correctlySpelledWords++
                correctChars += words[0].length
                
                document.getElementById(wordCount).style.color = 'rgba(0, 0, 0, 0.3)'

                if (currentWord.getBoundingClientRect().right > nextWord.getBoundingClientRect().left) {
                    nextWord.scrollIntoView()
                }

                input.value = ''
                words.shift()
                wordCount++
                characters += words[0].length

            } else if (input.value.endsWith(' ')) {
                input.value = input.value.trim()

                for (let i = 0; i < input.value.length; i++) {
                    input.value[i] === words[0][i] ? correctChars++ : incorrectChars++
                }

                document.getElementById(wordCount).style.color = 'rgba(0, 0, 0, 0.3)'
                document.getElementById(wordCount).style.textDecoration = 'line-through'

                if (currentWord.getBoundingClientRect().right > nextWord.getBoundingClientRect().left) {
                    nextWord.scrollIntoView()
                }

                input.value = ''
                words.shift()
                wordCount++
                characters += words[0].length

            } else if (
                input.value.trim().length > 0 && 
                input.value.trim().length > lastInput.length && 
                input.value.slice(-1) !== words[0][input.value.length - 1]
            ) {
                incorrectChars++
            }
        }

        case 'spacebar': {
            if (input.value.endsWith(' ')) {
                input.value = input.value.trim()

                if (input.value === words[0]) {
                    correctlySpelledWords++
                    correctChars += words[0].length
                    document.getElementById(wordCount).style.color = 'rgba(0, 0, 0, 0.3)'
                } else {
                    for (let i = 0; i < input.value.length; i++) {
                        input.value[i] === words[0][i] ? correctChars++ : incorrectChars++
                    }

                    document.getElementById(wordCount).style.color = 'rgba(0, 0, 0, 0.3)'
                    document.getElementById(wordCount).style.textDecoration = 'line-through'
                }

                if (currentWord.getBoundingClientRect().right > nextWord.getBoundingClientRect().left) {
                    nextWord.scrollIntoView()
                }

                input.value = ''
                words.shift()
                wordCount++
                characters += words[0].length

            } else if (
                input.value.trim().length > 0 && 
                input.value.trim().length > lastInput.length && 
                input.value.slice(-1) !== words[0][input.value.length - 1]
            ) {
                incorrectChars++
            }
        }
    }

    lastInput = input.value.trim()
}

if (config === 'spacebar') {
    toggle.style.transform = 'translate(20px)'
    toggleBox.style.backgroundColor = 'rgb(0, 230, 0)'
}

function toggleClick () {
    if (config === 'auto') {
        config = 'spacebar'
        localStorage.setItem('config', config)
        toggle.animate({transform: 'translateX(20px)'}, {duration: 200, fill: 'forwards'})
        toggleBox.animate({backgroundColor: 'rgb(0, 230, 0)'}, {duration: 200, fill: 'forwards'})
    } else {
        config = 'auto'
        localStorage.setItem('config', config)
        toggle.animate({transform: 'translateX(0px)'}, {duration: 200, fill: 'forwards'})
        toggleBox.animate({backgroundColor: 'rgb(220, 220, 220)'}, {duration: 200, fill: 'forwards'})
    }
}

input.addEventListener('input', timer)
input.addEventListener('input', checkWord)
toggleBox.addEventListener('click', toggleClick)