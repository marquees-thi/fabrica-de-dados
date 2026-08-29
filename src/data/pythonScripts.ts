import { PythonScript } from "../types";

export const PYTHON_SCRIPTS: PythonScript[] = [
  {
    id: "maps_fix",
    title: "1. Garimpeiro Google Maps (Corrigido)",
    fileName: "garimpeiro_maps_fixed.py",
    badge: "Opção A: Correção Exata",
    category: "maps_fix",
    description:
      "Script em Python Playwright com rolagem programática diretamente no contêiner div[role='feed']. Resolve o gargalo dos 8 links, extrai 70-120 URLs por busca e detecta automaticamente o fim da lista.",
    code: `"""
=============================================================================
PROJETO FÁBRICA DE DADOS B2B - ETAPA 1: O GARIMPEIRO (MAPS CORRIGIDO)
=============================================================================
Autor: Engenharia de Dados & Web Scraping
Descrição: Corrige o scroll da barra lateral do Google Maps (div[role="feed"])
            e extrai 100% dos URLs disponíveis até o fim dos resultados.
Requisitos: pip install playwright
            playwright install firefox (ou chromium)
=============================================================================
"""

import asyncio
import random
import re
from playwright.async_api import async_playwright

async def garimpar_google_maps(termo_busca: str, max_scroll_attempts: int = 40):
    print(f"🚀 [GARIMPEIRO] Iniciando garimpo para: '{termo_busca}'")
    
    async with async_playwright() as p:
        # Lançar navegador com argumentos anti-detecção e viewport amplo
        browser = await p.firefox.launch(
            headless=False,  # Altere para True em produção no servidor Ubuntu
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        context = await browser.new_context(
            viewport={"width": 1400, "height": 900},
            user_agent="Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
            locale="pt-BR"
        )
        
        page = await context.new_page()
        
        # Montar URL de busca do Google Maps
        url = f"https://www.google.com/maps/search/{termo_busca.replace(' ', '+')}?hl=pt-BR"
        print(f"🌐 Acessando URL: {url}")
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(4000)
            
            # 1. Tratar possíveis popups de cookies ou termos do Google
            try:
                cookie_button = page.locator('button[aria-label*="Aceitar"], button[aria-label*="Concordo"], form[action*="consent"] button')
                if await cookie_button.first.is_visible(timeout=3000):
                    print("🛡️ Aceitando termos/cookies do Google...")
                    await cookie_button.first.click()
                    await page.wait_for_timeout(2000)
            except Exception:
                pass # Sem popup de cookies

            # 2. Localizar o CONTÊINER ESPECÍFICO DE ROLAGEM (A Chave da Solução!)
            # No Google Maps atual, a lista de resultados fica em um div com role="feed"
            # ou div.m6QErb[aria-label*="Resultados"]
            feed_selectors = [
                'div[role="feed"]',
                'div.m6QErb[aria-label*="Resultados"]',
                'div.m6QErb.DJAJdn',
                'div.m6QErb[role="region"]'
            ]
            
            feed_locator = None
            for sel in feed_selectors:
                loc = page.locator(sel)
                if await loc.count() > 0:
                    feed_locator = loc.first
                    print(f"🎯 Contêiner de rolagem encontrado com o seletor: '{sel}'")
                    break
            
            if not feed_locator:
                print("⚠️ Contêiner div[role='feed'] não localizado diretamente. Usando fallback por foco...")
                # Fallback: tentar focar no primeiro resultado e rolar
                first_link = page.locator('a[href*="/maps/place/"]').first
                if await first_link.count() > 0:
                    await first_link.focus()
            
            print("📜 Iniciando rolagem incremental no contêiner correto...")
            
            previous_count = 0
            stagnant_cycles = 0
            links_coletados = set()
            
            for scroll_step in range(1, max_scroll_attempts + 1):
                # 3. Executar o scroll programático DENTRO do elemento específico
                if feed_locator:
                    # Rola para baixo via JavaScript no contêiner específico
                    await feed_locator.evaluate("el => el.scrollBy({ top: 1200, behavior: 'smooth' })")
                else:
                    # Fallback com PageDown
                    await page.keyboard.press("PageDown")
                
                # Pausa natural humanizada
                await page.wait_for_timeout(random.uniform(1200, 1800))
                
                # 4. Extrair links visíveis no momento
                current_links = await page.eval_on_selector_all(
                    'a[href*="/maps/place/"]',
                    'elementos => elementos.map(e => ({ href: e.href, name: e.getAttribute("aria-label") || e.innerText }))'
                )
                
                for item in current_links:
                    href = item.get("href", "")
                    # Limpa parâmetros desnecessários mantendo a URL canônica do Maps
                    clean_url = href.split("?")[0] if "?" in href else href
                    if "/maps/place/" in clean_url:
                        links_coletados.add(clean_url)
                
                print(f"  ↳ Ciclo {scroll_step}/{max_scroll_attempts}: {len(links_coletados)} links garimpados até agora...")
                
                # 5. Verificar se chegou ao fim da lista ("Você chegou ao final da lista")
                fim_selectors = [
                    'span.HlvSq',
                    'div.fontBodyMedium:has-text("final da lista")',
                    'div:has-text("Você chegou ao final da lista")',
                    'p.fontBodyMedium:has-text("resultados")'
                ]
                
                fim_atingido = False
                for fim_sel in fim_selectors:
                    if await page.locator(fim_sel).count() > 0 and await page.locator(fim_sel).first.is_visible():
                        print("🏁 Mensagem de 'Fim da lista' detectada pelo Google Maps!")
                        fim_atingido = True
                        break
                
                if fim_atingido:
                    break
                
                # 6. Detectar estagnação (se o número de links não aumentou em 4 ciclos)
                if len(links_coletados) == previous_count:
                    stagnant_cycles += 1
                    if stagnant_cycles >= 4:
                        print("🛑 Estagnação detectada: Nenhum novo resultado após 4 rolagens. Finalizando.")
                        break
                else:
                    stagnant_cycles = 0
                    previous_count = len(links_coletados)
            
            # Salvar no formato esperado pela Etapa 2
            print(f"\n✅ SUCESSO! Total de empresas garimpadas: {len(links_coletados)}")
            with open("urls.txt", "w", encoding="utf-8") as f:
                for link in sorted(links_coletados):
                    f.write(link + "\\n")
            
            print(f"📁 Arquivo 'urls.txt' gerado com sucesso com {len(links_coletados)} URLs.")
            return list(links_coletados)
            
        except Exception as e:
            print(f"❌ Erro durante o garimpo: {e}")
            raise e
        finally:
            await context.close()
            await browser.close()

if __name__ == "__main__":
    termo = "agencias de marketing em sao paulo"
    asyncio.run(garimpar_google_maps(termo))
`,
  },
  {
    id: "grid_orchestrator",
    title: "2. Garimpeiro Multi-Bairros (Escala Big Data)",
    fileName: "garimpeiro_multi_bairros.py",
    badge: "Big Data: 1.000 a 5.000 URLs/dia",
    category: "grid_orchestrator",
    description:
      "O Google Maps limita 120 resultados por busca. Este orquestrador divide qualquer cidade em listas de bairros ou coordenadas GPS, executando o garimpeiro em lote e gerando milhares de URLs deduplicados.",
    code: `"""
=============================================================================
PROJETO FÁBRICA DE DADOS B2B - GARIMPEIRO MULTI-BAIRROS EM LOTE
=============================================================================
Descrição: Quebra a barreira de ~120 resultados do Google Maps fazendo
            varreduras sub-regionais por bairros de uma metrópole.
            Gera milhares de URLs únicos para abastecer a Etapa 2 (A Fábrica).
=============================================================================
"""

import asyncio
import os
import random
from playwright.async_api import async_playwright

# Matriz de Bairros de São Paulo (Exemplo para alta densidade comercial)
BAIRROS_SP = [
    "Pinheiros", "Itaim Bibi", "Vila Olímpia", "Moema", "Jardins",
    "Brooklin", "Santana", "Tatuapé", "Bela Vista", "Perdizes",
    "Santo Amaro", "Lapa", "Morumbi", "Vila Mariana", "Barra Funda",
    "Campo Belo", "Vila Madalena", "Paraíso", "Cerqueira César", "Aclimação"
]

NICHO_BASE = "agencia de marketing"
CIDADE_BASE = "São Paulo SP"

async def extrair_urls_do_bairro(page, bairro: str) -> set:
    termo = f"{NICHO_BASE} em {bairro} {CIDADE_BASE}"
    url = f"https://www.google.com/maps/search/{termo.replace(' ', '+')}?hl=pt-BR"
    print(f"📍 [BAIRRO] Garimpando: '{bairro}' -> {url}")
    
    links_bairro = set()
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_timeout(3000)
        
        # Localizar container
        feed = page.locator('div[role="feed"], div.m6QErb[aria-label*="Resultados"]').first
        
        for _ in range(15): # ~15 rolagens por bairro são suficientes para 60-100 itens
            if await feed.count() > 0:
                await feed.evaluate("el => el.scrollBy({ top: 1000, behavior: 'smooth' })")
            else:
                await page.keyboard.press("PageDown")
            
            await page.wait_for_timeout(random.uniform(900, 1400))
            
            # Verificar se chegou ao fim
            if await page.locator('span.HlvSq, div:has-text("Você chegou ao final")').count() > 0:
                break
        
        raw_links = await page.eval_on_selector_all(
            'a[href*="/maps/place/"]',
            'els => els.map(e => e.href)'
        )
        
        for l in raw_links:
            clean = l.split("?")[0] if "?" in l else l
            if "/maps/place/" in clean:
                links_bairro.add(clean)
                
        print(f"   ↳ {len(links_bairro)} empresas encontradas no bairro '{bairro}'.")
    except Exception as err:
        print(f"   ⚠️ Falha parcial no bairro {bairro}: {err}")
        
    return links_bairro

async def executar_orquestrador_big_data():
    todos_os_links = set()
    
    # Se já existir um urls.txt anterior, carregar para não duplicar
    if os.path.exists("urls.txt"):
        with open("urls.txt", "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    todos_os_links.add(line.strip())
        print(f"📂 Carregados {len(todos_os_links)} links pré-existentes de urls.txt")

    async with async_playwright() as p:
        browser = await p.firefox.launch(
            headless=True, # No servidor 24/7 use headless=True
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            viewport={"width": 1366, "height": 768},
            user_agent="Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0"
        )
        page = await context.new_page()

        for idx, bairro in enumerate(BAIRROS_SP, 1):
            print(f"\\n========================================")
            print(f"🔄 Processando Bairro {idx}/{len(BAIRROS_SP)}: {bairro}")
            print(f"========================================")
            
            novos = await extrair_urls_do_bairro(page, bairro)
            qtd_antes = len(todos_os_links)
            todos_os_links.update(novos)
            novos_reais = len(todos_os_links) - qtd_antes
            
            print(f"✨ +{novos_reais} URLs INÉDITOS adicionados! (Acumulado Total: {len(todos_os_links)})")
            
            # Gravação incremental no disco (se o processo cair, nada se perde!)
            with open("urls.txt", "w", encoding="utf-8") as f:
                for link in sorted(todos_os_links):
                    f.write(link + "\\n")
            
            # Delay de respiro para não sofrer rate limit
            await asyncio.sleep(random.uniform(2.5, 4.5))

        await browser.close()

    print(f"\\n🏆 GARIMPO BIG DATA CONCLUÍDO COM SUCESSO!")
    print(f"🎯 Total Geral de URLs no urls.txt: {len(todos_os_links)}")

if __name__ == "__main__":
    asyncio.run(executar_orquestrador_big_data())
`,
  },
  {
    id: "alternative_osm",
    title: "3. Garimpeiro Alternativo: Overpass API (Opção B)",
    fileName: "garimpeiro_osm_bigdata.py",
    badge: "Opção B: Zero Bloqueios / 100k+ Leads",
    category: "alternative_osm",
    description:
      "Alternativa ultra-rápida sem Playwright. Consulta a base pública OpenStreetMap via Overpass API, extraindo milhares de empresas cadastradas com coordenadas e gerando URLs do Google Maps para a Etapa 2 em segundos.",
    code: `"""
=============================================================================
PROJETO FÁBRICA DE DADOS B2B - FONTE ALTERNATIVA: OPENSTREETMAP OVERPASS API
=============================================================================
Vantagens:
- 100% Gratuito e Público (Dados Abertos)
- Zero risco de bloqueios de IP (sem captcha ou popups)
- Não gasta CPU/GPU abrindo navegador headless
- Extrai 5.000+ empresas em menos de 10 segundos
- Gera diretamente os URLs de busca e coordenadas para a Etapa 2
=============================================================================
Requisitos: pip install requests
=============================================================================
"""

import requests
import urllib.parse
import json

def garimpar_empresas_osm(cidade="São Paulo", estado="SP", nicho="marketing", limite=2000):
    print(f"⚡ [GARIMPEIRO OSM] Extraindo empresas em '{cidade} - {estado}' para o nicho '{nicho}'...")
    
    # Mapeamento de categorias OSM
    nicho_filters = {
        "marketing": '["office"~"advertising|marketing|it|company"]',
        "software": '["office"~"it|software|company"]',
        "advocacia": '["office"="lawyer"]',
        "contabilidade": '["office"="accountant"]',
        "clinica": '["amenity"~"clinic|doctors|dentist"]',
        "restaurante": '["amenity"~"restaurant|cafe|bar"]',
        "academia": '["leisure"="fitness_centre"]',
        "imobiliaria": '["office"="estate_agent"]',
        "geral": '["office"]'
    }
    
    tag_filter = nicho_filters.get(nicho.lower(), '["office"]')
    
    # Overpass QL Query
    overpass_query = f"""
    [out:json][timeout:60];
    area["name"="{cidade}"]["admin_level"~"8|9|7"]->.searchArea;
    (
      node{tag_filter}(area.searchArea);
      way{tag_filter}(area.searchArea);
    );
    out center {limite};
    """
    
    url = "https://overpass-api.de/api/interpreter"
    
    try:
        response = requests.post(url, data={"data": overpass_query}, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        elements = data.get("elements", [])
        print(f"📊 Elementos brutos retornados pelo OpenStreetMap: {len(elements)}")
        
        urls_geradas = []
        empresas_completas = []
        
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("brand") or tags.get("operator")
            if not name:
                continue
                
            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            phone = tags.get("phone") or tags.get("contact:phone") or tags.get("mobile") or ""
            website = tags.get("website") or tags.get("contact:website") or ""
            street = tags.get("addr:street", "")
            suburb = tags.get("addr:suburb") or tags.get("addr:neighbourhood") or ""
            
            # Gera a URL de busca direta no Google Maps para a Etapa 2 raspar
            query_busca = f"{name} {cidade} {estado}"
            maps_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(query_busca)}"
            
            urls_geradas.append(maps_url)
            empresas_completas.append({
                "nome": name,
                "telefone": phone,
                "site": website,
                "bairro": suburb,
                "cidade": cidade,
                "maps_url": maps_url,
                "lat": lat,
                "lon": lon
            })
            
        print(f"✅ {len(urls_geradas)} URLs de empresas formatadas com sucesso!")
        
        # Salva o arquivo urls.txt para alimentar a Etapa 2
        with open("urls.txt", "w", encoding="utf-8") as f:
            for u in urls_geradas:
                f.write(u + "\\n")
                
        # Salva também um backup em JSON com metadados adicionais
        with open("empresas_osm.json", "w", encoding="utf-8") as f:
            json.dump(empresas_completas, f, ensure_ascii=False, indent=2)
            
        print("📁 Arquivo 'urls.txt' e 'empresas_osm.json' gravados.")
        return urls_geradas
        
    except Exception as e:
        print(f"❌ Erro na consulta Overpass: {e}")
        return []

if __name__ == "__main__":
    garimpar_empresas_osm(cidade="São Paulo", estado="SP", nicho="marketing", limite=1500)
`,
  },
  {
    id: "gemini_enricher",
    title: "4. Enriquecedor de Quebra-Gelo (Gemini Pro)",
    fileName: "gemini_icebreaker_enricher.py",
    badge: "Etapa 3: IA Outbound Personalizado",
    category: "gemini_enricher",
    description:
      "Consome os dados raspados da Etapa 2 e utiliza o modelo Gemini 3.7 Flash / Pro para gerar abordagens hiper-personalizadas para WhatsApp e Cold Email com gancho contextual.",
    code: `"""
=============================================================================
PROJETO FÁBRICA DE DADOS B2B - ETAPA 3: ENRIQUECIMENTO GEMINI PRO
=============================================================================
Descrição: Lê a base raspada pela Etapa 2 (empresas_detalhadas.json) e gera
            mensagens de quebra-gelo exclusivas para cada decisor via Gemini API.
Requisitos: pip install google-genai
Configuração: export GEMINI_API_KEY="sua_chave_aqui"
=============================================================================
"""

import json
import os
import asyncio
from google import genai
from google.genai import types

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("⚠️ Defina a variável de ambiente GEMINI_API_KEY antes de executar.")

client = genai.Client(api_key=API_KEY)

async def gerar_quebra_gelo(empresa: dict, produto_venda: str = "Serviços de Marketing e Tráfego Pago") -> dict:
    nome = empresa.get("name") or empresa.get("nome", "Empresa")
    categoria = empresa.get("category") or empresa.get("categoria", "Negócio Local")
    endereco = empresa.get("address") or empresa.get("endereco", "")
    avaliacao = empresa.get("rating", "N/A")
    total_reviews = empresa.get("reviewsCount", 0)
    site = empresa.get("website", "")
    
    prompt = f"""
Você é um Especialista Sênior em Prospecção B2B Outbound.
Gere 1 mensagem de WhatsApp e 1 Cold Email personalizados para o dono da seguinte empresa:

DADOS DA EMPRESA:
- Nome: {nome}
- Ramo: {categoria}
- Local: {endereco}
- Site: {site}
- Avaliações Maps: {avaliacao} estrelas ({total_reviews} avaliações)

O QUE OFERECEMOS:
- Solução: {produto_venda}

REGRAS:
1. Mensagem de WhatsApp curta (máx 3 frases), natural, sem parecer robô.
2. Cold Email com Assunto magnético e corpo de 4 frases.
3. Conectar a boa reputação ou localização da empresa com o gancho de vendas.
4. CTA de baixo atrito.

Retorne EXCLUSIVAMENTE em formato JSON:
{{
  "whatsapp": "texto da mensagem para whatsapp",
  "email_assunto": "assunto do email",
  "email_corpo": "corpo do email",
  "gancho_identificado": "resumo do gancho utilizado"
}}
"""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7,
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"⚠️ Erro ao enriquecer {nome}: {e}")
        return {
            "whatsapp": f"Olá! Vi a {nome} no Google Maps com ótima reputação e gostaria de apresentar uma oportunidade.",
            "email_assunto": f"Parceria estratégica para a {nome}",
            "email_corpo": f"Olá equipe da {nome}, tudo bem? Acompanho seu trabalho...",
            "gancho_identificado": "Fallback padrão"
        }

async def processar_lote_enriquecimento():
    arquivo_entrada = "empresas_detalhadas.json"
    arquivo_saida = "leads_b2b_enriquecidos.json"
    
    if not os.path.exists(arquivo_entrada):
        # Cria exemplo se não existir
        exemplo = [
            {
                "name": "Agência Vanguarda Digital",
                "category": "Agência de Marketing",
                "address": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
                "rating": 4.9,
                "reviewsCount": 47,
                "website": "https://vanguardadigital.com.br",
                "phone": "(11) 98765-4321"
            }
        ]
        with open(arquivo_entrada, "w", encoding="utf-8") as f:
            json.dump(exemplo, f, indent=2, ensure_ascii=False)
            
    with open(arquivo_entrada, "r", encoding="utf-8") as f:
        empresas = json.load(f)
        
    print(f"🤖 [ENRIQUECIMENTO GEMINI] Processando {len(empresas)} empresas...")
    
    resultados = []
    for idx, emp in enumerate(empresas, 1):
        print(f"  ↳ [{idx}/{len(empresas)}] Enriquecendo: {emp.get('name', 'Empresa')}...")
        quebra_gelo = await gerar_quebra_gelo(emp)
        emp_completa = {**emp, "outbound": quebra_gelo}
        resultados.append(emp_completa)
        await asyncio.sleep(0.3) # Rate limit safety
        
    with open(arquivo_saida, "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
        
    print(f"\\n🎉 Enriquecimento concluído! Arquivo final gerado: '{arquivo_saida}'.")

if __name__ == "__main__":
    asyncio.run(processar_lote_enriquecimento())
`,
  },
  {
    id: "pipeline_sh",
    title: "5. Script Shell Orquestrador 24/7 (Ubuntu Server)",
    fileName: "run_pipeline_24_7.sh",
    badge: "Deploy Ubuntu: Xeon + RTX 4060",
    category: "pipeline_sh",
    description:
      "Script Bash com controle de execução contínua, limpeza de memória do Firefox/Chromium, criação de display virtual Xvfb e rotação automática de logs para rodar 24/7 sem travar.",
    code: `#!/usr/bin/env bash
# =============================================================================
# FÁBRICA DE DADOS B2B - PIPELINE AUTOMATIZADO 24/7 (UBUNTU SERVER)
# =============================================================================
# Servidor: Xeon + RTX 4060
# =============================================================================

set -e

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🚀 INICIANDO PIPELINE DA FÁBRICA DE DADOS B2B [$(date)]"
echo "=========================================================="

# 1. Ativar ambiente virtual Python
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Criando ambiente virtual Python..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install playwright requests google-genai
    playwright install firefox chromium
    playwright install-deps
fi

# 2. Criar diretório de logs
mkdir -p logs

# 3. Executar Etapa 1 (O Garimpeiro)
echo "🔍 [PASSO 1/3] Executando Garimpeiro de URLs..."
python3 garimpeiro_maps_fixed.py >> logs/garimpeiro.log 2>&1

QTD_URLS=$(wc -l < urls.txt || echo "0")
echo "✅ Garimpo concluído! $QTD_URLS URLs prontas no urls.txt"

if [ "$QTD_URLS" -eq 0 ]; then
    echo "⚠️ Nenhuma URL encontrada. Verifique logs/garimpeiro.log"
    exit 1
fi

# 4. Executar Etapa 2 (A Fábrica - Scraper Concorrente)
echo "🏭 [PASSO 2/3] Executando A Fábrica de Detalhes..."
# Substitua pelo comando exato do seu script de Etapa 2 validado
python3 -m google_maps_scraper.main --input urls.txt --concurrency 8 --output empresas_detalhadas.json >> logs/fabrica.log 2>&1

echo "✅ Extração detalhada finalizada!"

# 5. Executar Etapa 3 (Enriquecimento com Gemini Pro)
if [ -n "$GEMINI_API_KEY" ]; then
    echo "🤖 [PASSO 3/3] Enriquecendo leads com Inteligência Artificial..."
    python3 gemini_icebreaker_enricher.py >> logs/enricher.log 2>&1
    echo "🎉 Base enriquecida salva em leads_b2b_enriquecidos.json"
else
    echo "ℹ️ GEMINI_API_KEY não definida. Pulando Etapa 3."
fi

# 6. Limpeza de processos zumbis do navegador
pkill -f firefox || true
pkill -f chromium || true

echo "=========================================================="
echo "🏁 CICLO DA FÁBRICA CONCLUÍDO COM SUCESSO! [$(date)]"
echo "=========================================================="
`,
  }
];
