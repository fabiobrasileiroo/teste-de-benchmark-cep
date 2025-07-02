const cep = "69023003"

async function testar(cep, api) {
  const url =
    api === "viacep"
      ? `https://viacep.com.br/ws/${cep}/json/`
      : `https://brasilapi.com.br/api/cep/v2/${cep}`

  const abort = new AbortController()
  const timeout = setTimeout(() => abort.abort(), 3000)

  const inicio = performance.now()
  try {
    const response = await fetch(url, { signal: abort.signal })
    const fim = performance.now()
    const data = await response.json()
    const tempo = Math.round(fim - inicio)

    return {
      api,
      tempo,
      logradouro: data.logradouro || data.street || "N/A",
    }
  } catch (err) {
    const fim = performance.now()
    return {
      api,
      tempo: Math.round(fim - inicio),
      logradouro: `Erro: ${err.name === "AbortError" ? "Timeout" : err.message}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function rodarTestes() {
  const resultados = []
  const tentativas = 10
  const temposViaCEP = []
  const temposBrasilAPI = []

  for (let i = 0; i < tentativas; i++) {
    const via = await testar(cep, "viacep")
    const brasil = await testar(cep, "brasilapi")
    resultados.push({ tentativa: i + 1, via, brasil })

    if (typeof via.tempo === "number") temposViaCEP.push(via.tempo)
    if (typeof brasil.tempo === "number") temposBrasilAPI.push(brasil.tempo)
  }

  console.table(
    resultados.map((r) => ({
      Tentativa: r.tentativa,
      "ViaCEP (ms)": r.via.tempo,
      "ViaCEP - Logradouro": r.via.logradouro,
      "BrasilAPI (ms)": r.brasil.tempo,
      "BrasilAPI - Logradouro": r.brasil.logradouro,
    }))
  )

  const media = (arr) =>
    arr.length > 0
      ? Math.round(arr.reduce((acc, cur) => acc + cur, 0) / arr.length)
      : "Sem dados"

  console.log("📊 Média de tempos:")
  console.log(`- ViaCEP: ${media(temposViaCEP)} ms`)
  console.log(`- BrasilAPI: ${media(temposBrasilAPI)} ms`)
}

rodarTestes()
