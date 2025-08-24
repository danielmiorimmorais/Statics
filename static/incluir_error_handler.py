#!/usr/bin/env python3
"""
Script para incluir o ErrorHandler em todos os arquivos HTML
"""

import os
import re

def incluir_error_handler():
    """Inclui o ErrorHandler em todos os arquivos HTML"""
    
    # Lista de arquivos HTML
    arquivos_html = [
        'dashboard.html',
        'rankings.html', 
        'videos.html',
        'channels.html',
        'analytics.html',
        'benchmark.html',
        'test.html',
        'test-completo.html'
    ]
    
    for arquivo in arquivos_html:
        if os.path.exists(arquivo):
            print(f"📝 Processando: {arquivo}")
            
            # Lê o arquivo
            with open(arquivo, 'r', encoding='utf-8') as f:
                conteudo = f.read()
            
            # Verifica se já tem o ErrorHandler
            if 'error-handler.js' in conteudo:
                print(f"   ✅ ErrorHandler já incluído em {arquivo}")
                continue
            
            # Procura pela linha com utils.js
            padrao = r'(<script src="js/utils\.js"></script>)'
            substituicao = r'<script src="js/error-handler.js"></script>\n    \1'
            
            novo_conteudo = re.sub(padrao, substituicao, conteudo)
            
            if novo_conteudo != conteudo:
                # Salva o arquivo
                with open(arquivo, 'w', encoding='utf-8') as f:
                    f.write(novo_conteudo)
                print(f"   ✅ ErrorHandler adicionado em {arquivo}")
            else:
                print(f"   ⚠️ Não foi possível adicionar ErrorHandler em {arquivo}")
        else:
            print(f"   ❌ Arquivo não encontrado: {arquivo}")

if __name__ == "__main__":
    print("🔧 Incluindo ErrorHandler em todos os arquivos HTML...")
    incluir_error_handler()
    print("✅ Processo concluído!")
