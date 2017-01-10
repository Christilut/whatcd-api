const expect = require('chai').expect
const fs = require('fs')
const log = require('loglevel')

const GazelleAPI = require('../index.js')

const COOKIE_FILE = 'cookie.json'
const USERNAME = process.env.GAZELLE_USERNAME
const PASSWORD = process.env.GAZELLE_PASSWORD
const HOSTNAME = 'https://passtheheadphones.me/'

if (process.env.VERBOSE) {
  log.setLevel(process.env.VERBOSE)
}


function deleteCookie() {
  if (fs.existsSync(COOKIE_FILE)) fs.unlinkSync(COOKIE_FILE)
}

describe.skip('cookie tests', function() {

  it('isLoggedIn without cookie', () => {
    deleteCookie()
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    expect(gazelle._isLoggedIn()).to.be.false
  })

  it('isLoggedIn with empty cookie', () => {
    deleteCookie()
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    fs.writeFileSync(COOKIE_FILE, '[]')

    expect(gazelle._isLoggedIn()).to.be.false

    deleteCookie()
  })

  it('isLoggedIn with valid cookie', () => {
    deleteCookie()
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    fs.writeFileSync(COOKIE_FILE, '[{}, {}]')

    expect(gazelle._isLoggedIn()).to.be.true

    deleteCookie()
  })

  it('should login successfully and create cookie.json', (done) => {
    deleteCookie()
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    gazelle._login()
      .then(response => {
        expect(fs.existsSync(COOKIE_FILE)).to.be.true
        deleteCookie()
        done()
      })
  })
})

describe('GazelleAPI tests', function() {
  this.timeout(10000)

  it('should search and return result object', (done) => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    gazelle.action('browse', {
        searchstr: 'sven hammond soul'
      })
      .then(response => {
        expect(response).to.be.an('object')
        done()
      })
  })

  it('should search twice and already be logged in the second search', (done) => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    gazelle.action('browse', {
        searchstr: 'sven hammond soul'
      })
      .then(response => {
        // fs.writeFileSync('./test/fixtures/browse.json', JSON.stringify(response))
        expect(response).to.be.an('object')

        gazelle.action('browse', {
            searchstr: 'sven hammond soul'
          })
          .then(response => {
            expect(response).to.be.an('object')
            done()
          })
      })
  })

  it('should find a 320 album with seeders', (done) => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    gazelle.search('rammstein', 'sehnsucht')
      .then(response => {
       expect(response).to.be.an('object')
        expect(response).to.deep.equal({
          artist: 'Rammstein',
          album: 'Sehnsucht',
          image: 'https://i.imgur.com/qVCZ90w.jpg',
          year: 1997,
          torrentId: 42967,
          encoding: '320'
        })
        done()
      })
  })

  it('should find a V0 album with seeders', (done) => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    gazelle.search('Ayreon', 'Into the Electric Castle')
      .then(response => {
        expect(response).to.be.an('object')
        expect(response).to.deep.equal({
          artist: 'Ayreon',
          album: 'Into the Electric Castle',
          image: 'https://ptpimg.me/wgl3oe.jpg',
          year: 1998,
          torrentId: 141602,
          encoding: "V0 (VBR)"
        })

        done()
      })
  })

  it('should download a torrent file to the given path', (done) => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    const testpath = './test/'
    const testfile = testpath + 'Rammstein - Sehnsucht - 1997 (CD - MP3 - 320).torrent'

    gazelle.download(42967, testpath)
      .then(response => {
        expect(fs.existsSync(testfile)).to.be.true
        fs.unlinkSync(testfile)
        done()
      })
  })

  it('should error because the path contains a filename', () => {
    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    const testpath = './test/test.torrent'

    expect(gazelle.download.bind(gazelle, 30836090, testpath)).to.throw(Error, 'path cannot contain a filename')
  })

  it('should extract the torrent filename from the response header', () => {
    const headers = {
      'content-disposition': 'attachment; filename="Rammstein - Sehnsucht - 1997 (CD - MP3 - 320)-30836090.torrent"'
    }

    expect(GazelleAPI._extractFilename(headers)).to.equal('Rammstein - Sehnsucht - 1997 (CD - MP3 - 320).torrent')
  })
})

describe('library tests', function() {
  this.timeout(15000)

  it('should build valid uri', () => {
    const uri = GazelleAPI._buildUri(HOSTNAME, 'ajax', 'browse', {
      searchstr: 'rammstein'
    })

    expect(uri).to.be.a('string')
    expect(uri).to.equal(HOSTNAME + `ajax.php?action=browse&searchstr=rammstein`)
  })

  it('should rate limit to take atleast 10 seconds to perform 6 requests', (done) => {
    const startTime = (new Date()).getTime()

    const gazelle = new GazelleAPI(USERNAME, PASSWORD, HOSTNAME)

    // login is also a request
    gazelle.action('browse', {
        searchstr: 'sven hammond soul'
      })
      .then(response => {
        expect(response.body).to.be.an('object')

        gazelle.action('browse', {
            searchstr: 'sven hammond soul'
          })
          .then(response => {
            expect(response.body).to.be.an('object')

            gazelle.action('browse', {
                searchstr: 'sven hammond soul'
              })
              .then(response => {
                expect(response.body).to.be.an('object')

                gazelle.action('browse', {
                    searchstr: 'sven hammond soul'
                  })
                  .then(response => {
                    expect(response.body).to.be.an('object')

                    gazelle.action('browse', {
                        searchstr: 'sven hammond soul'
                      })
                      .then(response => {
                        expect(response.body).to.be.an('object')
                        expect((new Date()).getTime() - startTime).to.be.at.least(10000)
                        done()
                      })
                  })
              })
          })
      })
  })
})
