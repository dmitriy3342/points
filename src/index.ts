import * as PIXI from 'pixi.js'
import Stats from "./stats"
import {Renderer, Container, State, Rectangle, Loader, Ticker, IPoint, Texture, Graphics} from 'pixi.js'

// const WIDTH = 800
// const HEIGHT = 600
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
let SIZE = 50
let SPEEDK = 4
let SPEEDK_TO_FRIEND = 2
let RADIUS_SPACE = 30
let RADIUS = 10


let audio = document.createElement('audio')
audio.style.display = "none"
document.body.append(audio)
// audio.src = "https://dmitriy3342.github.io/andromeda/music/Metallic Suns.mp3"
audio.src = "/audio/Linear_Vision_WDfaVpSnyAs_320kbps.mp3"
audio.loop = true

// @ts-ignore
let btn: HTMLElement = document.getElementById('btn')

btn.addEventListener('click', function () {
    // @ts-ignore
    let count: HTMLInputElement = document.getElementById('count')
    // @ts-ignore
    let radius: HTMLInputElement = document.getElementById('radius')
    // @ts-ignore
    let radius_friendly: HTMLInputElement = document.getElementById('radius_friendly')
    // @ts-ignore
    let speedk: HTMLInputElement = document.getElementById('speedk')
    // @ts-ignore
    let speedk_to_friend: HTMLInputElement = document.getElementById('speedk_to_friend')

    SIZE = parseInt(count.value)
    SPEEDK = parseInt(speedk.value)
    SPEEDK_TO_FRIEND = parseInt(speedk_to_friend.value)
    RADIUS_SPACE = parseInt(radius_friendly.value)
    RADIUS = parseInt(radius.value)

    createApp()
    audio.play()
})


function randomColor(): number {
    let letters = '89ABCDE'
    let color = ''
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)]
    }
    return parseInt(color, 16)
}


interface Context {
    width: number
    height: number
    entities: Entity[]

    register(entity: Entity): void
}

class Entity {
    container: PIXI.Container
    context: Context

    constructor(context: Context, container: PIXI.Container) {
        this.container = container
        this.context = context
        context.register(this)
    }

    update() {
    }

    hasIntersect(entity: Entity, space: number): boolean {
        return false
    }

    updateIntersect(entity: Entity) {
    }

    updateDirection(entity: Entity) {

    }
}


class Point extends Entity {
    deltaX: number
    deltaY: number
    radius: number
    color: number
    hasDirection: boolean
    speed: number

    constructor(context: Context, x: number, y: number, radius: number = 10, color: number = 0xDE3249, speed: number) {
        super(context, function () {

            const g = new PIXI.Graphics()
            g.lineStyle(0) // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
            g.beginFill(color, 1)
            g.drawCircle(0, 0, radius)
            g.endFill()

            // Rotate around the center
            g.position.x = x  //| context.width / 2
            g.position.y = y  //| context.height / 2
            // g.scale.x = 2;
            // g.scale.y = 2;
            return g
        }())
        this.deltaX = Math.random() * speed
        this.deltaY = Math.random() * speed
        this.radius = radius
        this.color = color
        this.hasDirection = false
        this.speed = speed
        this.startRandomDirection()
    }


    update() {
        let w = this.context.width
        let h = this.context.height
        let r = this.radius
        // this.container.rotation += 0.01
        this.container.position.x += this.deltaX
        this.container.position.y += this.deltaY

        if (this.container.position.x + r >= w) {
            this.container.position.x = w - r
            this.deltaX *= -1
        } else if (this.container.position.x - r <= 0) {
            this.container.position.x = r
            this.deltaX *= -1
        }
        if (this.container.position.y + r >= h) {
            this.container.position.y = h - r
            this.deltaY *= -1
        } else if (this.container.position.y - r <= 0) {
            this.container.position.y = r
            this.deltaY *= -1
        }
    }

    updateIntersect(entity: Entity) {
        let point = <Point>entity
        this.deltaX *= -1
        this.deltaY *= -1
        point.deltaX *= -1
        point.deltaY *= -1

        while (this.hasIntersect(entity, 0)) {
            this.container.position.x += this.deltaX
            this.container.position.y += this.deltaY
            point.container.position.x += point.deltaX
            point.container.position.y += point.deltaY
        }
    }

    startRandomDirection() {
        let self = this

        function update() {
            if (self.hasDirection) return
            self.deltaX = Math.random() * self.speed
            self.deltaY = Math.random() * self.speed
            setTimeout(update, Math.random() * 8000 + 2000)
        }

        update()
    }

    updateDirection(entity: Entity) {
        if (this.color === 0x000000) {
            return
        }
        let point = <Point>entity

        if (point.color !== 0x000000) {
            return
        }

        if (!this.hasDirection) {
            let self = this
            setTimeout(function () {
                self.hasDirection = false
                if (point.color === 0x000000) {
                    point.color = randomColor()
                    point.speed = SPEEDK
                    point.startRandomDirection()
                    let g = <Graphics>point.container
                    g.beginFill(point.color, 1)
                    g.drawCircle(0, 0, point.radius)
                }
                self.startRandomDirection()
                // g.endFill()
            }, 3000)
        }

        let ex = entity.container.position.x
        let ey = entity.container.position.y
        let er = (<Point>entity).radius
        let x = this.container.position.x
        let y = this.container.position.y
        let r = this.radius

        this.deltaX = ((ex - x) / 100) * SPEEDK_TO_FRIEND
        this.deltaY = ((ey - y) / 100) * SPEEDK_TO_FRIEND

        this.hasDirection = true
        // this.deltaX *= -1
        // this.deltaY *= -1
        // point.deltaX *= -1
        // point.deltaY *= -1
        // this.container.position.x += this.deltaX
        // this.container.position.y += this.deltaY
        // point.container.position.x += this.deltaX
        // point.container.position.y += this.deltaY

    }

    hasIntersect(entity: Entity, space: number = 0): boolean {
        let ex = entity.container.position.x
        let ey = entity.container.position.y
        let er = (<Point>entity).radius
        let x = this.container.position.x
        let y = this.container.position.y
        let r = this.radius
        return Math.sqrt(Math.pow(ex - x, 2) + Math.pow(ey - y, 2)) - er - r <= space
    }
}

class Application implements Context {
    renderer!: Renderer
    stage: Container
    container: Container
    stats: any
    isUpdating: boolean
    width: number
    height: number
    backgroundColor: number
    entities: Entity[]

    constructor(width: number = 800, height: number = 600, backgroundColor: number = 0xFFFFFF) {
        this.width = width
        this.height = height
        this.backgroundColor = backgroundColor
        this.createRender()
        this.stage = new Container()

        // this.container = new PIXI.ParticleContainer(200000, [false, true, false, false, false])

        // this.container = new PIXI.ParticleContainer(200000, {
        //     vertices: false,
        //     position: true,
        //     rotation: false,
        //     uvs: false,
        //     tint: false
        // })
        this.container = new PIXI.Container()

        this.stage.addChild(this.container)
        // this.createStats()
        this.entities = []
        this.isUpdating = false

        this.render()
        this.resize()
        console.log(`W:${this.width} H:${this.height}`)

    }

    register(entity: Entity) {
        this.entities.push(entity)
        this.container.addChild(entity.container)
    }

    createRender() {
        // @ts-ignore
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height)
        this.renderer.backgroundColor = this.backgroundColor
        document.body.appendChild(this.renderer.view)
        this.renderer.view.style["transform"] = "translatez(0)"
        this.renderer.view.style.position = "absolute"

        // amount = (this.renderer instanceof PIXI.WebGLRenderer) ? 100 : 5;
        //
        //	bloom = new PIXI.filters.BloomFilter();
        //stage.filters = [bloom];

        // if(amount == 5)
        // {
        // this.renderer.context.mozImageSmoothingEnabled = false
        // this.renderer.context.webkitImageSmoothingEnabled = false

        // }
    }

    createStats() {
        this.stats = new Stats()
        document.body.appendChild(this.stats.domElement)
        this.stats.domElement.style.position = "absolute"
        this.stats.domElement.style.top = "0px"
    }

    resize(): void {
        let width = window.innerWidth
        let height = window.innerHeight

        if (width > this.width) width = this.width
        if (height > this.height) height = this.height
        this.width = width
        this.height = height

        let w = window.innerWidth / 2 - width / 2
        let h = window.innerHeight / 2 - height / 2

        this.renderer.view.style.left = window.innerWidth / 2 - width / 2 + "px"
        this.renderer.view.style.top = window.innerHeight / 2 - height / 2 + "px"

        if (this.stats) {
            this.stats.domElement.style.left = w + "px"
            this.stats.domElement.style.top = h + "px"
        }
        this.renderer.resize(width, height)
    }

    update() {

        for (let i = 0; i < this.entities.length; i++) {
            let entity = <Point>this.entities[i]
            entity.update()

            for (let j = i + 1; j < this.entities.length; j++) {
                let point = <Point>this.entities[j]

                if (entity.hasIntersect(point, RADIUS_SPACE)) {
                    entity.updateDirection(point)
                    point.updateDirection(entity)
                }

                if (entity.hasIntersect(point, 0)) {
                    entity.updateIntersect(point)
                }

            }

        }
    }

    render() {
        this.renderer.render(this.stage)
    }

    startUpdate(): void {
        let self = this
        self.isUpdating = true

        function update() {
            if (self.stats)
                self.stats.begin()
            self.update()
            self.render()
            if (self.isUpdating) {
                requestAnimationFrame(update)
            }
            if (self.stats)
                self.stats.end()
        }

        update()

    }

    stop(): void {
        this.isUpdating = false
    }

    start(): void {
        this.startUpdate()
    }

}


let app: Application

function createApp() {
    app = new Application(WIDTH, HEIGHT)
    app.start()
    app.resize()

    for (let i = 0; i < SIZE; i++) {
        // let x = Math.random() * 1000 % (WIDTH - 10) + 5
        // let y = Math.random() * 1000 % (HEIGHT - 10) + 5
        // let r = 10

        let x, y, r

        while (true) {
            r = RADIUS

            x = Math.random() * 10000 % (WIDTH - r * 2) + r
            y = Math.random() * 10000 % (HEIGHT - r * 2) + r

            let hasIntersect = false

            for (let j = 0; j < app.entities.length; j++) {
                let entity = <Point>app.entities[j]
                let ex = entity.container.position.x
                let ey = entity.container.position.y
                let er = entity.radius
                if (Math.sqrt(Math.pow(ex - x, 2) + Math.pow(ey - y, 2)) - er - r <= 0) {
                    hasIntersect = true
                    break
                }
            }
            if (!hasIntersect) {
                break
            }
        }
        let color = 0x000000
        let speed = 0
        if (i === SIZE - 1) {
            color = 0x00ff00
            // speed = Math.random()
            speed = SPEEDK
        }

        new Point(app, x, y, r, color, speed)
    }
}

// createApp()