const axios = require("axios");
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

const mergeImg = require('merge-img');


const naverWebtoonDomain = 'https://comic.naver.com';

var searchUrl = naverWebtoonDomain + '/search.nhn?keyword=';

var webtoonName = process.argv[2];

if (!fs.existsSync(webtoonName)) {
    fs.mkdirSync(webtoonName);
}

var searchName = '';

for (var i = 0; i < webtoonName.length; i++) {
    if (i == webtoonName.length - 1) {
        searchName += webtoonName[i];
    } else {
        searchName += webtoonName[i] + '+';
    }
}


const getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
    }
};

let searchKeywordUrl = searchUrl + encodeURI(searchName);

console.log(`searchKeywordUrl: ${searchKeywordUrl}`);

const crawler = async () => {
    let searchHtml = await getHtml(searchKeywordUrl);
    let $ = cheerio.load(searchHtml.data);

    const webtoonHref = $("#content > div:nth-child(2) > ul > li:nth-child(1) > h5 > a").attr('href');
    let webtoonUrl = naverWebtoonDomain + webtoonHref;

    console.log(`webtoonUrl: ${webtoonUrl}`);

    let webtoonListHtml = await getHtml(webtoonUrl);
    $ = cheerio.load(webtoonListHtml.data);

    const lastNoUrl = $("#content > table > tbody > tr:nth-child(2) > td.title > a").attr('href');
    // https://comic.naver.com/webtoon/detail.nhn?titleId=727189&no=10&weekday=fri

    let lastNo = lastNoUrl.split('no=')[1].replace(/[^0-9]/g, '');

    console.log(`lastNo: ${lastNo}`);

    webtoonLink = webtoonLink.replace('list.nhn', 'detail.nhn');

    // for (let i = 1; i <= lastNo; i++) {
    //     (function (j) {
    //         let images = [];
    //         getHtml(webtoonLink + '&no=' + j)
    //             .then(html => {
    //                 console.log('웹툰페이지 링크: ' + webtoonLink.replace('list.nhn', 'detail.nhn') + '&no=' + j);

    //                 let $ = cheerio.load(html.data);
    //                 // #comic_view_area > div.wt_viewer > img:nth-child(1)

    //                 let imageList = $("#comic_view_area > div.wt_viewer > img");

    //                 console.log(`이미지갯수: ${imageList.length}`)

    //                 imageList.each(function (idx, img) {

    //                     let imageUrl = $(this).attr('src');
    //                     // console.log('웹툰 이미지 링크: ' + imageUrl);


    //                     // let imageFileName = webtoonName + '/1' + '-' + idx + '.jpg';
    //                     let imageFileName = j + '-' + idx + '.jpg';
    //                     request({ method: 'GET', uri: imageUrl, encoding: null, headers: { Referer: naverWebtoonDomain } }).pipe(fs.createWriteStream(imageFileName));
    //                     // let image = request({ method: 'GET', uri: imageUrl, encoding: null, headers: { Referer: naverWebtoonDomain } }).pipe(images.push());

    //                     images.push('./' + imageFileName);

    //                 })
    //             }).then(()=> {
    //                 mergeImg(images, { direction: true }).then((img) => {
    //                     img.write(j+'.jpg', () => console.log('done'));
    //                   });
    //                 }
    //             )
    //     })(i)
    // }

    let images = [];

    await getHtml(webtoonLink + '&no=' + 1)
        .then(html => {
            // console.log('웹툰페이지 링크: ' + webtoonLink.replace('list.nhn', 'detail.nhn') + '&no=' + 1);

            let $ = cheerio.load(html.data);
            // #comic_view_area > div.wt_viewer > img:nth-child(1)

            let imageList = $("#comic_view_area > div.wt_viewer > img");
            console.log(`이미지갯수: ${imageList.length}`)

            imageList.each(function (idx, img) {
                let imageUrl = $(this).attr('src');
                // console.log('웹툰 이미지 링크: ' + imageUrl);
                let imageFileName = '1-' + idx + '.jpg';
                // request({ method: 'GET', uri: imageUrl, encoding: null, headers: { Referer: naverWebtoonDomain } }).pipe(fs.createWriteStream(imageFileName));
                images.push(imageFileName);
            })
        })


    // console.log(images);
    let img = await mergeImg(images, { direction: true });
    // let img = await mergeImg(['1-0.jpg', '1-1.jpg', '1-2.jpg', '1-3.jpg', '1-4.jpg', '1-5.jpg', '1-6.jpg'], { direction: true });
    img.write('1.jpg', ()=>{console.log('done')});

}

crawler();



