const lang = "fr_FR";
async function getChamps() {
    let versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    versions = await versions.json()
    const lastVersion = versions[0]
    let champions = await fetch(`https://ddragon.leagueoflegends.com/cdn/${lastVersion}/data/${lang}/champion.json`)
    champions = await champions.json()

    return champions
}

function removeClass(selector, classToRemove, cleanInnerHTML = false) {
    let prec = document.querySelectorAll(selector);
    prec.forEach(elem => {
        if (cleanInnerHTML) { elem.innerHTML = "" }
        elem.classList.remove(classToRemove);
    })
} 

function changeCategory(categorySelector) {
    removeClass('.categorySelector.active', 'active');
    removeClass('.challengeSelection.active', 'active');

    const selectedCategory = categorySelector.getAttribute('data-id');
    let targetedCategory = document.getElementById(selectedCategory);
    categorySelector.classList.add('active');
    targetedCategory.classList.add('active');

    changeChallenge(targetedCategory.childNodes[1])
}

function changeChallenge(challengeSelector) {
    removeClass('.challengeSelector.active', 'active');
    removeClass('.challengeSection.active', 'active', true);

    const selectedChallenge = challengeSelector.getAttribute('data-id');
    let targetedChallenge = document.getElementById(selectedChallenge);
    targetedChallenge.classList.add('active');
    challengeSelector.classList.add('active');

    proliferate(selectedChallenge)
}

function addProgressBar(selectedChallenge, championNumber) {
    let targetedChallenge = document.getElementById(selectedChallenge);
    const storage = readArray(selectedChallenge);
    const checkedNumber = storage?.length ? storage.length : 0;

    const bar = document.createElement("progress");
    bar.setAttribute("max", championNumber);
    bar.setAttribute("value", checkedNumber);

    targetedChallenge.appendChild(bar)
}

function proliferate(selectedChallenge) {
    let targetedChallenge = document.getElementById(selectedChallenge);
    let wrapper = document.createElement('div');
    const storage = readArray(selectedChallenge)

    wrapper.classList.add('flex');
    getChamps()
        .then(champions => {
            const champs = Object.keys(champions.data);
            const version = champions.version
            champs.forEach(champ => { wrapper.appendChild(newImage(champ, version, selectedChallenge, storage)) })
            addProgressBar(selectedChallenge, champs.length)
            targetedChallenge.appendChild(wrapper)
        })
}

function newImage(champion, version, challenge, storage) {
    let image = document.createElement('img');
    image.setAttribute('src', `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png`);
    image.setAttribute('id', `${challenge}_${champion}`);

    if (storage?.includes(champion)) { image.classList.add('checked') }

    image.setAttribute('onclick', 'check(this)')
    return image
}

function readArray(challenge) { return localStorage.getItem(challenge)?.split(',') }

function updateProgress(targetedChallenge) {
    let bar = targetedChallenge.querySelector('progress');
    const storage = readArray(targetedChallenge.id);
    const checkedNumber = storage?.length ? storage.length : 0;

    bar.setAttribute("value", checkedNumber);
}

function check(champion) {
    champion.classList.toggle('checked');
    const championInfo = champion.id.split('_');

    let storage = readArray(championInfo[0])

    if (storage == undefined) { 
        localStorage.setItem(championInfo[0], championInfo[1]) 
    }
    else if (storage.includes(championInfo[1])) { 
        localStorage.setItem(championInfo[0], storage.filter(val => val != championInfo[1])) 
    }
    else {
        console.log(championInfo)
        if (championInfo[0] == 'm7') {
            let m5 = readArray('m5');
            if (!m5.includes(championInfo[1])) { 
                m5.push(championInfo[1])
                localStorage.setItem('m5', m5.filter(val => val != "")) // storage.filter removes any void string
            }
        }
        storage.push(championInfo[1])
        localStorage.setItem(championInfo[0], storage.filter(val => val != "")) // storage.filter removes any void string
        
    }

    updateProgress(champion.parentNode.parentNode)
}