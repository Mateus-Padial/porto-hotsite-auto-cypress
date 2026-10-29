Feature: Catálogo PortoPlus - Pessoa Física
    Como um participante PortoPlus pessoa física
    Quero acessar e interagir com o catálogo de pontos
    Para resgatar produtos, vouchers, milhas e outros benefícios

    Background:
        Given que o usuário está autenticado no catálogo via SSO

    @smoke
    Scenario: CT01 - Acessar catálogo PortoPlus via SSO
        Then deve visualizar o catálogo de pontos pessoa física

    Scenario: CT02 - Validar jornada guiada do catálogo
        Then deve percorrer e concluir todos os passos da jornada guiada
    @skip
    Scenario: CT03 - Adicionar produto ao carrinho e resgatar
        When o usuário seleciona um produto na vitrine
        And adiciona o produto ao carrinho
        Then o carrinho deve exibir o produto adicionado
    @skip
    Scenario: CT04 - Favoritar um produto
        When o usuário seleciona um produto na vitrine
        And marca o produto como favorito
        Then o produto deve aparecer na lista de favoritos

    Scenario: CT05 - Buscar produto pela barra de pesquisa
        When o usuário digita "Notebook" na barra de pesquisa
        And confirma a busca
        Then os resultados devem exibir produtos relacionados ao termo "Notebook"
    
    Scenario: CT06 - Validar saldo de pontos disponível
        Then o saldo de pontos do usuário deve estar visível
        And o saldo deve ser um valor numérico válido
    
    Scenario: CT07 - Acessar e validar extrato de pontos
        When o usuário acessa o extrato de pontos
        Then o extrato deve exibir o histórico de movimentações
        And cada movimentação deve conter data, descrição e valor de pontos
    
    Scenario: CT08 - Filtrar produtos por categoria
        When o usuário seleciona a categoria "Eletrônicos"
        Then apenas produtos devem ser exibidos na vitrine

    Scenario: CT09 - Visualizar dados do perfil no catálogo
        When o usuário acessa a área de perfil
        Then os dados cadastrais do usuário devem ser exibidos corretamente
        And o nome do usuário deve estar visível no perfil

    @skip
    Scenario: CT10 - Resgatar voucher via catálogo
        When o usuário navega até a categoria de vouchers
        And seleciona um voucher disponível
        And confirma o resgate do voucher
        Then o voucher deve ser exibido em Meus Vouchers

    @skip
    Scenario: CT11 - Resgatar milhas via catálogo
        When o usuário navega até a categoria de milhas
        And seleciona uma companhia aérea parceira
        And confirma a transferência de milhas
        Then a transferência deve ser registrada com sucesso

    @skip
    Scenario: CT12 - Realizar recarga de celular via catálogo
        When o usuário navega até a categoria de recargas
        And informa um número de celular válido
        And seleciona o valor da recarga
        And confirma a recarga
        Then a recarga deve ser processada com sucesso

    @skip
    Scenario: CT13 - Acessar parceiro Befly Conecta
        When o usuário acessa a seção de parceiros de viagem
        And seleciona o parceiro Befly Conecta
        Then deve ser redirecionado corretamente para o ambiente da Befly
