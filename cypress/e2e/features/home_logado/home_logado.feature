Feature: Validação da Home - Usuário Logado
  Como um usuário logado no hotsite PortoPlus
  Quero visualizar corretamente minhas informações
  Para acessar funcionalidades como saldo, vouchers e FAQ

  Background:
    Given que o usuário logue no hotsite PortoPlus

  @smoke
  Scenario: CT01 - Validar usuário logado no hotsite
    Then o usuário deve visualizar seu nome junto ao ícone de usuário
    And deve visualizar novos menus disponíveis

  Scenario: CT02 - Visualizar saldo de pontos
    When o usuário clica no módulo de saldo
    Then deve visualizar corretamente o saldo de pontos

  Scenario Outline: CT03.1 a CT03.5 - Redirecionamento dos submenus "Pra mim"
    When o usuário clica no submenu "<submenu>"
    Then deve ser redirecionado para a página "<urlEsperada>"

    Examples:
      | submenu                  | urlEsperada            |
      | Meus Vouchers            | /meus-vouchers         |
      | Meus Relacionamentos     | /meus-relacionamentos  |
      | FAQ Cartão               | /faq/cartao            |
      | FAQ Compras Com Desconto | /faq/descontos         |
      | Produtos Porto           | /produtos-porto-seguro |

  Scenario: CT03.1.1 - Validar elementos da página Meus Vouchers
    Given que o usuário está na página Meus Vouchers
    Then deve ser validar a pagina Meus Voucher:
      | Título       |
      | Menu lateral |

  Scenario: CT03.2.1 - Validar elementos da página Meus Resgates
    Given que o usuário está na página Meus Relacionamentos
    Then deve ser validar a pagina Meus Relacionamentos:
      | Título       |
      | Menu lateral |
      | Duvida       |

  Scenario: CT03.3.1 - Validar elementos da página FAQ Cartão
    Given que o usuário está na página FAQ Cartão
    Then deve ser validar a pagina FAQ Cartão:
      | Título         |
      | Campo pesquisa |

  Scenario: CT04.5.1 - Validar elementos da página Produtos Porto
    Given que o usuário está na página Produtos Porto
    Then deve ser validar a pagina Produtos Porto:
      | Banner             |
      | Porto Seguro Auto  |
      | Instituto Porto    |
      | Seguro Residencial |
      | Centro Automotivo  |
      | Azul Seguro Auto   |
      | Financiamento      |
      | Porto Faz          |

  Scenario Outline: CT05.1 a CT05.3 - Redirecionamento dos submenus "Meus Pontos"
    When o usuário clica no submenu "<submenu>"
    Then deve ser redirecionado para a página "<urlEsperada>"

    Examples:
      | submenu               | urlEsperada            |
      | Meu Extrato           | /meu-extrato           |
      | Histórico de Resgates | /historico-de-resgates |
      | Programa Anterior     | /programa-anterior     |

  Scenario: CT05.1.1 - Validar elementos da página Meu Extrato
    Given que o usuário está na página Meu Extrato
    Then deve ser validar a pagina Meu Extrato:
      | Título             |
      | Menu lateral       |
      | Saldo              |
      | Histórico          |
      | Detalhe dos pontos |
      | Pontos a expirar   |

  Scenario: CT05.2.1 - Validar elementos da página Histórico de Resgates
    Given que o usuário está na página Histórico de Resgates
    Then deve ser validar a pagina Historico de Resgates:
      | Título       |
      | Menu lateral |

  Scenario: CT05.3.1 - Validar elementos da página Programa Anterior
    Given que o usuário está na página Programa Anterior
    Then deve ser validar a pagina Programa Anterior:
      | Título    |
      | Resgates  |
      | Pontuação |

  Scenario Outline: CT07 a CT07.4 - Redirecionamento em Troque Pontos logado
    When o usuário clica em "<categoria>" na seção Troque Pontos
    Then deve ser redirecionado para o marketplace

    Examples:
      | categoria      |
      | Game           |
      | Casa e Cozinha |
      | Eletrônicos    |
      | TVs            |

  Scenario: CT08 - Validar direcionamento Troca de Pontos
    When o usuário clica na opção Troca de Pontos
    Then deve ser redirecionado para o marketplace PortoPlus
  
  Scenario: CT09 - Validar logout
    When o usuário clica no botão Sair no perfil
    Then deve ser redirecionado para o hotsite já deslogado


