Feature: Validação da Home - Usuário Deslogado
  Como um usuário deslogado
  Quero acessar a home do hotsite do PortoPlus
  Para visualizar corretamente as informações e redirecionamentos disponíveis

  Background:
    Given que o usuário acessa o hotsite PortoPlus


  @smoke
  Scenario: CT01 - Validar as informações exibidas na home
    Then o usuário deve visualizar os seguintes elementos na home:
      | Logo portoplus       | Sobre o PortoPlus | FAQ Compras com Desconto |
      | Abas principais      | Ícone Boneco      | Botão Entrar             |
      | Carrossel de banners | Cards de serviços | Rodapé completo          |

  Scenario: CT02 - Validar as informações "Sobre o PortoPlus"
    When o usuário clica no link Sobre o PortoPlus
    Then deve visualizar o conteúdo da página

  Scenario: CT02.1 - link Regulamento do PortoPlus (seta para maximizar e minimizar)
    When o usuário clica na seta do link "Regulamento do PortoPlus"
    Then o conteúdo deve alternar entre exibido e oculto
  
  Scenario: CT02.2 - Download do regulamento
    When o usuário clica no link "Download" do regulamento
    Then o arquivo deve ser baixado no formato ".pdf"

  Scenario: CT02.3 - Abrir PDF do regulamento
    When o usuário clica no PDF do regulamento
    Then uma nova aba é aberta com o conteúdo do regulamento

  Scenario: CT02.4 - Navegar de volta para a Home via breadcrumb
    When o usuário clica no breadcrumb Home
    Then o usuário deve ser redirecionado para a home

  Scenario: CT03 - Acessar FAQ Compras com Desconto
    When o usuário clica no link "FAQ > FAQ Compras Com Desconto"
    Then deve visualizar o conteúdo correspondente

  Scenario: CT04 - Clicar no banner de oferta
    When o usuário clica no banner da home
    Then deve ser redirecionado para a página vinculada ao banner

  Scenario: CT05 - Abrir modal "Troque pontos por produtos e serviços"
    When o usuário clica no card Troque pontos por produtos e serviços
    Then deve visualizar uma prévia de produtos e categorias

  Scenario: CT05.1 - Abrir modal "Compre produtos e serviços com descontos"
    When o usuário clica no card Compre produtos e serviços com descontos
    Then deve visualizar catálogo de ofertas com filtros
  
  Scenario Outline: CT06 até CT06.7 - Redirecionamentos em Serviços Porto
    When o usuário clica no serviço "<serviço>"
    Then deve ser redirecionado para "<url>"

    Examples:
      | serviço           | url |
      | Seguro Auto       | http://localhost/|
      | Seguro Azul       | http://localhost/|
      | Seguro Residência | http://localhost/|
      | Financiamento     | http://localhost/ |
      | Vida              | http://localhost/|
      | Porto Serviço    | http://localhost/|

  Scenario Outline: CT07 a CT07.3 - Redirecionamento em Troque Pontos
    When o usuário clica em "<categoria>" na seção Troque Pontos
    Then deve ser redirecionado para a página de login

    Examples:
      | categoria      |
      | Game           |
      | Casa e Cozinha |
      | Eletrônicos    |
      | TVs            |

  Scenario Outline: CT08 a CT08.3 - Redirecionamento Parceiros de Viagem
    When o usuário clica em "<parceiro>" em Parceiros de viagem
    Then deve ser redirecionado para a pagina "/detalhe-Viagem"

    Examples:
      | parceiro     |
      | Smiles       |
      | Azul viagens |
      | Miles&GO     |
      | Latam Pass   |


