# DevOpsPilot Terraform Outputs

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ids" {
  description = "IDs of the NAT Gateways"
  value       = aws_nat_gateway.main[*].id
}

# EKS Cluster Outputs
output "cluster_id" {
  description = "EKS cluster ID"
  value       = aws_eks_cluster.main.id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.name
}

output "cluster_iam_role_arn" {
  description = "IAM role ARN associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.arn
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_primary_security_group_id" {
  description = "Cluster security group that was created by Amazon EKS for the cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_version" {
  description = "The Kubernetes version for the EKS cluster"
  value       = aws_eks_cluster.main.version
}

# EKS Node Group Outputs
output "node_group_arn" {
  description = "Amazon Resource Name (ARN) of the EKS Node Group"
  value       = aws_eks_node_group.main.arn
}

output "node_group_status" {
  description = "Status of the EKS Node Group"
  value       = aws_eks_node_group.main.status
}

output "node_security_group_id" {
  description = "Security group ID attached to the EKS nodes"
  value       = aws_security_group.eks_nodes.id
}

output "node_iam_role_name" {
  description = "IAM role name associated with EKS node group"
  value       = aws_iam_role.eks_nodes.name
}

output "node_iam_role_arn" {
  description = "IAM role ARN associated with EKS node group"
  value       = aws_iam_role.eks_nodes.arn
}

# RDS Outputs (if created)
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = var.create_rds ? aws_db_instance.main[0].endpoint : null
}

output "rds_port" {
  description = "RDS instance port"
  value       = var.create_rds ? aws_db_instance.main[0].port : null
}

output "rds_database_name" {
  description = "RDS database name"
  value       = var.create_rds ? aws_db_instance.main[0].db_name : null
}

output "rds_username" {
  description = "RDS master username"
  value       = var.create_rds ? aws_db_instance.main[0].username : null
  sensitive   = true
}

# ElastiCache Outputs (if created)
output "elasticache_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = var.create_elasticache ? aws_elasticache_replication_group.main[0].primary_endpoint_address : null
}

output "elasticache_port" {
  description = "ElastiCache Redis port"
  value       = var.create_elasticache ? aws_elasticache_replication_group.main[0].port : null
}

output "elasticache_reader_endpoint" {
  description = "ElastiCache Redis reader endpoint"
  value       = var.create_elasticache ? aws_elasticache_replication_group.main[0].reader_endpoint_address : null
}

# Security Group Outputs
output "cluster_security_group_rules" {
  description = "Security group rules attached to the cluster security group"
  value = {
    id = aws_security_group.eks_cluster.id
    ingress = aws_security_group.eks_cluster.ingress
    egress  = aws_security_group.eks_cluster.egress
  }
}

output "node_security_group_rules" {
  description = "Security group rules attached to the node security group"
  value = {
    id = aws_security_group.eks_nodes.id
    ingress = aws_security_group.eks_nodes.ingress
    egress  = aws_security_group.eks_nodes.egress
  }
}

# kubectl Configuration
output "kubectl_config" {
  description = "kubectl config to connect to the cluster"
  value = {
    apiVersion      = "v1"
    kind            = "Config"
    current-context = aws_eks_cluster.main.name
    contexts = [{
      name = aws_eks_cluster.main.name
      context = {
        cluster = aws_eks_cluster.main.name
        user    = aws_eks_cluster.main.name
      }
    }]
    clusters = [{
      name = aws_eks_cluster.main.name
      cluster = {
        server                     = aws_eks_cluster.main.endpoint
        certificate-authority-data = aws_eks_cluster.main.certificate_authority[0].data
      }
    }]
    users = [{
      name = aws_eks_cluster.main.name
      user = {
        exec = {
          apiVersion = "client.authentication.k8s.io/v1beta1"
          command    = "aws"
          args = [
            "eks",
            "get-token",
            "--cluster-name",
            aws_eks_cluster.main.name,
            "--region",
            var.aws_region
          ]
        }
      }
    }]
  }
  sensitive = true
}

# Connection Information
output "connection_info" {
  description = "Connection information for the DevOpsPilot infrastructure"
  value = {
    cluster_name     = aws_eks_cluster.main.name
    cluster_endpoint = aws_eks_cluster.main.endpoint
    region          = var.aws_region
    vpc_id          = aws_vpc.main.id
    
    # Database connections
    database = var.create_rds ? {
      endpoint = aws_db_instance.main[0].endpoint
      port     = aws_db_instance.main[0].port
      database = aws_db_instance.main[0].db_name
    } : null
    
    # Cache connections
    cache = var.create_elasticache ? {
      primary_endpoint = aws_elasticache_replication_group.main[0].primary_endpoint_address
      reader_endpoint  = aws_elasticache_replication_group.main[0].reader_endpoint_address
      port            = aws_elasticache_replication_group.main[0].port
    } : null
  }
}
