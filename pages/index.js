import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Script from 'next/script'
import Head from 'next/head'
import Img from 'next/image'
import { throttle } from 'lodash'
import SpaceCubes from '../public/artifacts/SpaceCubes.json'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [mintNumber, setMintNumber] = useState(1)
  const [mintValue, setMintValue] = useState(20)
  const [isWhitelist, setIsWhitelist] = useState(false)
  const [threeLoaded, setThreeLoaded] = useState(false)
  const [navFilled, setNavFilled] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [transaction, setTransaction] = useState(false)
  const [orbitControlLoaded, setOrbitControlLoaded] = useState(false)

  const metaData = {
    title:
      'Space Cubes - A collection of 999 interactive NFTs, created by chambaz.eth',
    description:
      'Space Cubes is a technical exploration of interactive NFTs. A collection of 999 interactive NFTs, created by chambaz.eth',
  }

  const checkWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account: ', account)
      checkNetwork()
      setCurrentAccount(account)
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWallet = async () => {
    const { ethereum } = window

    if (!ethereum) {
      alert('Please install Metamask!')
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Found an account! Address: ', accounts[0])
      checkNetwork(accounts[0])
      setCurrentAccount(accounts[0])
    } catch (err) {
      console.log(err)
    }
  }

  const checkNetwork = async () => {
    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })
    const provider = new ethers.providers.Web3Provider(ethereum)
    const { chainId } = await provider.getNetwork()

    if (chainId !== 137) {
      setNetworkError(true)
      return false
    } else {
      setNetworkError(false)
      checkWhitelist(accounts[0])
      return true
    }
  }

  const addNetwork = async () => {
    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    }

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          rpcUrls: ['https://polygon-rpc.com/'],
          blockExplorerUrls: ['https://polygonscan.com/'],
        },
      ],
    })

    checkNetwork()
  }

  const checkWhitelist = async (account) => {
    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_SPACE_CUBES_ADDRESS,
      SpaceCubes.abi,
      signer
    )

    const data = await contract.isWhitelisted(account)
    setIsWhitelist(data)
    setMintValue(data ? 0 : 20)
  }

  const mintNFT = async () => {
    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    }

    const networkCheck = await checkNetwork()

    if (!networkCheck) {
      return
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_SPACE_CUBES_ADDRESS,
      SpaceCubes.abi,
      signer
    )

    const data = await contract.mintNFTs(mintNumber, {
      value: ethers.utils.parseEther(mintValue.toString()),
    })

    setTransaction(data.hash)
  }

  useEffect(() => {
    checkWalletIsConnected()

    document.addEventListener(
      'scroll',
      throttle(() => {
        if (document.documentElement.scrollTop > 20) {
          setNavFilled(true)
        } else {
          setNavFilled(false)
        }
      }, 100)
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      <Head>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:url" content="http://www.spacecubes.xyz" />
        <meta
          property="og:image"
          content="https://www.spacecubes.xyz/spacecubes.jpg"
        />
      </Head>

      <canvas className={styles.bg} id="bg"></canvas>

      <div className={styles.fg}>
        <nav className={navFilled ? styles.navFilled : styles.nav}>
          <a className={styles.logoContainer} herf="/">
            <canvas className={styles.logo} id="logo"></canvas>
          </a>
          {!currentAccount ? (
            <button className={styles.button} onClick={connectWallet}>
              Connect with MetaMask
            </button>
          ) : (
            <p className={styles.account}>
              <strong>Wallet Connected</strong>{' '}
              {`
                ${currentAccount.substring(0, 4)}...${currentAccount.substring(
                currentAccount.length - 4
              )}
              `}
            </p>
          )}
        </nav>

        <main>
          <div className={styles.masthead}>
            <div className={styles.header}>
              <h1 className={styles.title}>SpaceCubes</h1>
              <p className={styles.description}>
                A collection of 999 interactive NFTs, created by{' '}
                <a
                  href="https://www.chambaz.tech/"
                  target="_blank"
                  rel="noreferrer">
                  chambaz.eth
                </a>
                . <br />
                See the collection on{' '}
                <a
                  href="https://opensea.io/collection/space-cubes-nft"
                  target="_blank"
                  rel="noreferrer">
                  OpenSea
                </a>
                .
              </p>
            </div>

            <div className={styles.canvasContainer}>
              <canvas className={styles.canvas} id="cube"></canvas>
              <div className={styles.mint}>
                {!networkError ? (
                  <>
                    <div className={styles.mintModificationContainer}>
                      <button
                        onClick={() => {
                          if (mintNumber <= 1) {
                            return
                          }
                          const newMintNumber = mintNumber - 1
                          setMintNumber(newMintNumber)
                          setMintValue(isWhitelist ? 0 : newMintNumber * 20)
                        }}
                        className={styles.mintModification}>
                        -
                      </button>
                      <span>{mintNumber}</span>
                      <button
                        onClick={() => {
                          if (mintNumber >= 5) {
                            return
                          }
                          const newMintNumber = mintNumber + 1
                          setMintNumber(newMintNumber)
                          setMintValue(isWhitelist ? 0 : newMintNumber * 20)
                        }}
                        className={styles.mintModification}>
                        +
                      </button>
                    </div>
                    <button onClick={mintNFT} className={styles.button}>
                      Mint for
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        viewBox="0 0 38.4 33.5"
                        fill="none"
                        style={{ margin: '0px 6px 0 8px' }}>
                        <path
                          fill="#8247E5"
                          d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                        />
                      </svg>
                      {mintValue} MATIC
                    </button>
                  </>
                ) : (
                  <p className={styles.error}>Switich to Polygon network</p>
                )}
                {transaction && (
                  <p className={styles.smallPrint}>
                    Mint succesful! View your{' '}
                    <a
                      className={styles.smallPrintLink}
                      href={`https://polygonscan.com/tx/${transaction}`}
                      target="_blank"
                      rel="noreferrer">
                      transaction on Polygonscan
                    </a>
                  </p>
                )}
              </div>
            </div>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.scrollIcon}>
              <path
                d="M13.3335 22.6667L19.3335 16.6667L13.3335 10.6667"
                stroke="#aaaaaa"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(90, 16, 16)"></path>
            </svg>
          </div>

          <div className={styles.copyContainer}>
            <div className={styles.copyBlock}>
              <h2 className={styles.subTitle}>What are SpaceCubes?</h2>
              <p>
                The Space Cubes project is a technical exploration of
                interactive NFTs. The NFT meta data standard includes an
                animation_url which usually points to an MP4 or gif hosted on
                IPFS. OpenSea supports HTML files for the animation_url which
                opens up a lot of possibilities and was the inspiration for the
                Space Cubes project. Each Space Cube token&apos;s meta data
                points to a jpg image as well as an HTML bundle which renders a
                &lt;canvas&gt; element with a WebGL powered interactive version,
                both hosted on IPFS.
              </p>
              <p>
                NFT Marketplaces supporting HTML animation_urls opens up a world
                of possibilities.
                <br /> A user can have digital ownership of not only an image
                but an HTML5 code bundle.
              </p>
              <p>
                <strong>NFT&apos;s can be interactive...</strong>
              </p>
            </div>
            <div className={styles.copyBlock}>
              <h2 className={styles.subTitle}>
                How to mint on Polygon{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  viewBox="0 0 38.4 33.5"
                  fill="none"
                  style={{ marginLeft: 10 }}>
                  <path
                    fill="#8247E5"
                    d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                  />
                </svg>
              </h2>
              <p>
                Polygon is a layer 2 scaling solution for Ethereum. It aims to
                increase speed and efficiency of the level 1 blockchain, in turn
                providing lower gas fees for all! Polygon is supported on
                OpenSea and many other NFT marketplaces. Follow these steps to
                set up your MetaMask wallet.
              </p>
              <div className={styles.copyBlockSection}>
                <h3 className={styles.copyBlockSubHeading}>
                  Add Polygon to MetaMask
                </h3>
                <button onClick={addNetwork} className={styles.button}>
                  Add{' '}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15px"
                    viewBox="0 0 38.4 33.5"
                    fill="none"
                    style={{ margin: '0px 6px 0 8px' }}>
                    <path
                      fill="#8247E5"
                      d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                    />
                  </svg>
                  Polygon Network
                </button>
              </div>
              <div className={styles.copyBlockSection}>
                <h3 className={styles.copyBlockSubHeading}>
                  Bridge MATIC to Polygon
                </h3>
                <p>
                  First things first, you need to get hold of some MATIC. You
                  can either purchase from an exchange like Coinbase, or swap
                  another token on{' '}
                  <a
                    href="https://uniswap.org/"
                    target="_blank"
                    rel="noreferrer">
                    Uniswap
                  </a>
                  . Once you have MATIC in your wallet you can bridge the assets
                  onto the Polygon network using the{' '}
                  <a
                    href="https://wallet.polygon.technology/bridge/"
                    target="_blank"
                    rel="noreferrer">
                    Polygon Bridge
                  </a>
                  .
                </p>

                <Img
                  src="/img/polygon-bridge.png"
                  alt="Bridge ETH to Polygon"
                  width={547}
                  height={561}
                />
              </div>
              <div className={styles.copyBlockSection}>
                <h3 className={styles.copyBlockSubHeading}>
                  Mint &amp; View Your Assets!
                </h3>
                <p>
                  You are ready to mint Space Cubes. Make sure you&apos;re on
                  the Polygon network and click mint. Good luck!
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <a href="https://www.chambaz.tech/" target="_blank" rel="noreferrer">
            <span className={styles.footerEmoji}>🚀</span> Created by{' '}
            <span className={styles.footerLink}>chambaz.eth</span>
          </a>
        </footer>
      </div>

      <script
        id="snoise-function"
        type="x-shader/x-vertex"
        dangerouslySetInnerHTML={{
          __html: `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                              -0.577350269189626,  // -1.0 + 2.0 * C.x
                              0.024390243902439); // 1.0 / 41.0
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i); // Avoid truncation effects in permutation
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
  
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
    `,
        }}
      />
      <script
        id="vertex-shader"
        type="x-shader/x-vertex"
        dangerouslySetInnerHTML={{
          __html: `
      uniform float u_time;
      uniform vec2 u_randomisePosition;

      varying float vDistortion;
      varying float xDistortion;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vDistortion = snoise(vUv.xx * 3. - u_randomisePosition * 0.15);
        xDistortion = snoise(vUv.yy * 1. - u_randomisePosition * 0.05);
        vec3 pos = position;
        pos.z += (vDistortion * 35.);
        pos.x += (xDistortion * 25.);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
        }}
      />
      <script
        id="fragment-shader"
        type="x-shader/x-fragment"
        dangerouslySetInnerHTML={{
          __html: `
      vec3 rgb(float r, float g, float b) {
        return vec3(r / 255., g / 255., b / 255.);
      }

      vec3 rgb(float c) {
        return vec3(c / 255., c / 255., c / 255.);
      }

      uniform vec3 u_bg;
      uniform vec3 u_bgMain;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_time;

      varying vec2 vUv;
      varying float vDistortion;

      void main() {
        vec3 bg = rgb(u_bg.r, u_bg.g, u_bg.b);
        vec3 c1 = rgb(u_color1.r, u_color1.g, u_color1.b);
        vec3 c2 = rgb(u_color2.r, u_color2.g, u_color2.b);
        vec3 bgMain = rgb(u_bgMain.r, u_bgMain.g, u_bgMain.b);

        float noise1 = snoise(vUv + u_time * 0.08);
        float noise2 = snoise(vUv * 2. + u_time * 0.1);

        vec3 color = bg;
        color = mix(color, c1, noise1 * 0.6);
        color = mix(color, c2, noise2 * .4);

        color = mix(color, mix(c1, c2, vUv.x), vDistortion);

        float border = smoothstep(0.1, 0.6, vUv.x);

        color = mix(color, bgMain, 1. -border);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
        }}
      />
      <Script
        src="/lib/three.js"
        onLoad={() => {
          setThreeLoaded(true)
        }}
      />
      <Script src="/lib/randomcolor.js" />
      {threeLoaded && (
        <>
          <Script
            src="/lib/orbitcontrols.js"
            onLoad={() => {
              setOrbitControlLoaded(true)
            }}
          />
        </>
      )}
      {orbitControlLoaded && (
        <>
          <Script src="/lib/spacecubes.js" />
        </>
      )}
    </div>
  )
}
