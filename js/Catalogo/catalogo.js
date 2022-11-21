addEventListener('load', () => {
    if(localStorage.getItem('url_foto_perfil')){
        let nomeUsuario = localStorage.getItem('nome_usuario');
        let urlFotoPerfil = localStorage.getItem('url_foto_perfil');

        document.getElementById('img-foto-perfil').src = urlFotoPerfil;
        document.getElementById('b-nome-usuario').innerText = nomeUsuario;

        // salva os dados das tendencias de filmes da semana
        let data = consultaTendenciasTMDB('movie', 'week');

        data.then(promise => {
            data = promise['results'].slice(0, 4);
            
            let index = 0;
            while(index < data.length){
                let idFilme = data[index]['id'];
                let posterFilme = `https://image.tmdb.org/t/p/w500${data[index]['poster_path']}`;

                let imgElement = document.getElementById(`filme-${index+1}`);
                imgElement.src = posterFilme;
                imgElement.alt = `movie-${idFilme}`;
                
                index++;
            }
        });

        // salva os dados das tendencias de series da semana
        data = consultaTendenciasTMDB('tv', 'week');

        data.then(promise => {
            data = promise['results'].slice(0, 4);
            
            let index = 0;
            while(index < data.length){
                let idSerie = data[index]['id'];
                let posterEntreterimento = `https://image.tmdb.org/t/p/w500${data[index]['poster_path']}`;

                let imgElement = document.getElementById(`serie-${index+1}`);
                imgElement.src = posterEntreterimento;
                imgElement.alt = `tv-${idSerie}`;
                
                index++;
            }    
        });

        mediaType = [
            'movie',
            'tv'
        ];

        // gera um indice randomico entre 0 e 1.
        // se for 0 entao sera listado os filmes, se for 1 sera listado as series
        let tipoEntreterimento = mediaType[Math.floor(Math.random() * 2)];
        data = consultaPorGenero(tipoEntreterimento, '80');

        data.then(promise => {
            atribuiDadosEntreterimento(tipoEntreterimento, promise, 'crime');   
        });

        data = consultaAtualizacoesDaSemana();

        data.then(promise => {
            data = promise['results'].slice(0, 4);
            
            let index = 0;
            let indexId = 0;
            while(index < data.length){
                let idEntreterimento = data[index]['id'];
                let posterEntreterimento;
                let dadosFilme = consultaDadosPorId('movie', idEntreterimento);

                dadosFilme.then(promise => {
                    return promise;
                }).then(jsonData => {
                    posterEntreterimento = jsonData['poster_path']; 
                }).then(() => {
                    let imgElement = document.getElementById(`atualizacao-${indexId+1}`);
                    imgElement.alt = `movie-${idEntreterimento}`;
                    if(posterEntreterimento){
                        imgElement.src = `https://image.tmdb.org/t/p/w500${posterEntreterimento}`;
                    } else {
                        imgElement.className = 'img-nao-encontrada';
                        imgElement.src = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';
                    }
                    indexId++;
                })

                index++;
            }    
        });

        tipoEntreterimento = mediaType[Math.floor(Math.random() * 2)];
        data = consultaPorGenero(tipoEntreterimento, '99');

        data.then(promise => {
            atribuiDadosEntreterimento(tipoEntreterimento, promise, 'documentario');      
        });

        // pegando todas as ancoras (links/href/a) com este respectivo id.
        let ancorasCatalogo = document.querySelectorAll('#detalhes-entreterimento');

        ancorasCatalogo.forEach(ancoraCatalogo => {
            ancoraCatalogo.addEventListener('click', () => {
                // acessando o elemento 'img' e pegando o 'alt'.
                let idEntreterimento = ancoraCatalogo.firstChild.nextElementSibling.alt;
                tipoEntreterimento = idEntreterimento.split('-')[0];
                idEntreterimento = idEntreterimento.split('-')[1];
                sessionStorage.setItem('idEntreterimento', idEntreterimento);
                sessionStorage.setItem('tipoEntreterimento', tipoEntreterimento);
            })
        });

    } else {
        window.location.href = '../Login/login.html';
    }
});

function atribuiDadosEntreterimento(mediaType, promise, idFoto){
    data = promise['results'].slice(0, 4);
            
    let index = 0;
    while(index < data.length){
        let idEntreterimento = data[index]['id'];
        let posterEntreterimento = `https://image.tmdb.org/t/p/w500${data[index]['poster_path']}`;
        let imgElement = document.getElementById(`${idFoto}-${index+1}`);
        
        imgElement.alt = `${mediaType}-${idEntreterimento}`;
        if(posterEntreterimento){
            imgElement.src = `https://image.tmdb.org/t/p/w500${posterEntreterimento}`;
        } else {
            imgElement.className = 'img-nao-encontrada';
            imgElement.src = 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';
        }
        
        index++;
    }  
}

// mediaType -> tipo de midia: all, movie, tv e person.
// timeWindow -> tempo que esta em tendencia -> day, week.
function consultaTendenciasTMDB(mediaType, timeWindow){
    const url = `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}`;
    const api_key = '0279131df8eec775fc20e8a5d97731f6';
    const language = 'pt-BR';
    const sort_by = 'popularity.desc';
    const include_adult = 'false';
    const include_video= 'false';
    const page = '1';
    
    return fetch(`${url}?api_key=${api_key}&language=${language}&sort_by=${sort_by}&include_adult=${include_adult}&include_video=${include_video}&page=${page}`, {
                method: "GET",
            }).then(response => { 
                return response.json();
            }).then(data => {
                return data;
            });
}

// mediaType -> tipo de midia: all, movie, tv e person.
// genreId -> id do genero.
function consultaPorGenero(mediaType, genreId) {
    const url = `https://api.themoviedb.org/3/discover/${mediaType}`;
    const api_key = '0279131df8eec775fc20e8a5d97731f6';
    const language = 'pt-BR';
    const sort_by = 'popularity.desc';
    const include_adult = 'false';
    const include_video= 'false';
    const page = '1';

    return fetch(`${url}?api_key=${api_key}&language=${language}&sort_by=${sort_by}&include_adult=${include_adult}&include_video=${include_video}&with_genres=${genreId}&page=${page}`, {
        method: "GET",
    }).then(response => { 
        return response.json();
    }).then(data => {
        return data;
    });
}

function consultaAtualizacoesDaSemana() {
    const url = 'https://api.themoviedb.org/3/movie/changes';
    const api_key = '0279131df8eec775fc20e8a5d97731f6';
    const language = 'pt-BR';
    const sort_by = 'primary_release_date.desc';
    const include_adult = 'false';

    return fetch(`${url}?api_key=${api_key}&language=${language}&sort_by=${sort_by}&include_adult=${include_adult}`, {
        method: "GET",
    }).then(response => { 
        return response.json();
    }).then(data => {
        return data;
    });
}

// mediaType -> tipo de midia: all, movie, tv e person.
// id -> id do filme ou serie em questão.
function consultaDadosPorId(mediaType, id) {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}`;
    const api_key = '0279131df8eec775fc20e8a5d97731f6';
    const language = 'pt-BR';

    return fetch(`${url}?api_key=${api_key}&language=${language}`, {
        method: "GET",
    }).then(response => {
        return response.json()
    }).then(data => {
        return data;
    })
}