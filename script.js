var words = []
const warning = document.querySelector('.warning')
const wordsContainer = document.querySelector('.wordsContainer')
const wordsDiv = document.querySelector('#words')
const minutesP = document.querySelector('.minutes')
const secondsP = document.querySelector('.seconds')
const input = document.querySelector('.input')
const score = document.querySelector('#score')
const loading = document.querySelector('.loadingContainer')
var interval
var seconds = 60
var timerStarted = false
var wordCount = 0
var correctlySpelledWords = 0
var characters = 0
var correctChars = 0
var incorrectChars = 0

function getWords() {
    try {
        axios.get('https://random-word-api.herokuapp.com/word?number=1000&length=6')
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
        loading.style.visibility = 'hidden'
    } 
}

function timer() {
    if (timerStarted || input.value.trim().length === 0) {
        return
    }

    timerStarted = true

    warning.style.visibility = 'hidden'

    interval = setInterval(() => {
        seconds--

        if (seconds < 1) {
            clearInterval(interval)
            input.disabled = true
            input.style.color = 'gray'
            input.style.cursor = 'not-allowed'
            input.value = input.value.trim()
    
            if (input.value === words[0]) {
                correctlySpelledWords++
                document.getElementById(wordCount).style.color = 'green'
                wordCount++
            }

            for (let i = 0; i < input.value.length; i++) {
                input.value[i] === words[0][i] ? correctChars++ : incorrectChars++
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

function checkWord(event) {
    input.value = input.value.trim()
    let inputLength = input.value.length
    let currentWord = document.getElementById(wordCount)
    let nextWord = document.getElementById(wordCount + 1)

    if (seconds < 1)
        return

    if (event.key === ' ') {
        if (inputLength < 1) {
            input.value = ''
            return
        }

        if (input.value === words[0]) {
            correctlySpelledWords++
            correctChars += words[0].length
            document.getElementById(wordCount).style.color = 'green'
        } else {
            for (let i = 0; i < inputLength; i++) {
                input.value[i] === words[0][i] ? correctChars++ : incorrectChars++
            }

            document.getElementById(wordCount).style.color = 'red'
        }

        if (currentWord.getBoundingClientRect().right > nextWord.getBoundingClientRect().left) {
            nextWord.scrollIntoView()
        }

        words.shift()
        input.value = ''
        wordCount++
        characters += words[0].length

    } else if (event.key.length === 1 && input.value.slice(-1) !== words[0][inputLength - 1]) {
        incorrectChars++
    } 
}

input.addEventListener('input', timer)
input.addEventListener('keyup', (e) => checkWord(e))
