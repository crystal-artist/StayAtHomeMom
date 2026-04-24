export default {
  async fetch(request, env) {
    let res = await env.ASSETS.fetch(request)

    if (res.status === 404) {
      return env.ASSETS.fetch(
        new Request(new URL('/index.html', request.url).toString())
      )
    }

    return res
  }
}